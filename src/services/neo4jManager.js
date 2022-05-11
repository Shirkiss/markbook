const neo4j = require('neo4j-driver');
const queries = require('./neo4j/queries');
const consts = require('./neo4j/helpers/consts');
const {deconstructCypherObject} = require('./neo4j/helpers/cypherHelper');
const HEALTH_CHECK_STRING = 'Healthy';
const QUERY_RESULT_ERROR_PREFIX = 'ERROR:';

class Neo4jManager {

    constructor() {
        this.database_name = process.env.NEO4J_DATABASE_NAME || 'neo4j';
    }

    async init() {
        const endpoint = process.env.NEO4J_ENDPOINT || 'neo4j+s://faa74a68.databases.neo4j.io';
        const username = process.env.NEO4J_USERNAME || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || '3WIkmmYhm7T8EYJFJJU-0bwWo--z9ZqZzVlz8zmh7b8';
        this.driver = neo4j.driver(endpoint, neo4j.auth.basic(username, password));
        if (!await this.deepHealth()) {
            throw new Error('Failed to initialize neo4j session instance!');
        }
        this.loadQueries();
    }

    async deepHealth() {
        const session = await this.newSession();
        try {
            const writeQuery = `WITH $healthString as healthcheck RETURN healthcheck`
            const result = await session.writeTransaction(tx =>
                tx.run(writeQuery, {healthString: HEALTH_CHECK_STRING})
            )
            return result.records && result.records.length === 1 && result.records[0].get('healthcheck') === HEALTH_CHECK_STRING;
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async destroy() {
        await this.driver.close();
    }

    async newSession() {
        const {driver} = this;

        const sessionOptions = {
            database: this.database_name,
        };

        return driver.session(sessionOptions);
    }

    _validateParams(params, required) {
        // verify all required params were provided
        required.forEach((propName) => {
            if (!(propName in params)) throw new Error(`"${propName}" is required but missing in query params`);
        });

        return params;
    }

    // Will pass a new driver session as the first parameter to a given function
    async querySessionWrapper(obj, func, transaction, finalParams, metadata) {
        const query = obj.constructor.name;

        const querySession = await this.newSession(transaction, metadata);

        try {
            const results = await obj[func].bind(obj)(querySession, consts.consts.DEFAULT_TIMEOUT, finalParams, metadata);
            results.bookmark = querySession.lastBookmark();
            return results;
        } catch (e) {
            if (e instanceof neo4j.Neo4jError) {
                e.query = query;
                e.finalParams = finalParams;
                e.metadata = metadata;
            }
            throw (e);
        } finally {
            await querySession.close();
        }
    }


    async performQuery(name, ...args) {
        const query = queries[name];

        // validate parameters
        const [params, metadata] = args;
        const {required, optional, transaction} = query;

        let finalParams = params;

        if (params && required && optional) {
            // supports also batch operations
            finalParams = Array.isArray(params) === false
                ? this._validateParams(params, required, optional)
                : params.map(item => this._validateParams(item, required, optional));
        }

        // execute the query
        const res = await this.querySessionWrapper(query, 'perform', transaction, finalParams, metadata);

        // process query results
        return this.constructor.buildQueryResult(res);
    }

    static buildQueryResult(res) {
        if (!res) {
            console.log(res);
            throw new Error('empty query result');
        }

        // if the query returned { value, err } it will not be processed further
        if ((res.value || res.err) && !res.records) {
            return {
                value: res.value,
                err: res.err ? new Error(res.err) : null,
                bookmark: res.bookmark,
            };
        }

        let resValue = deconstructCypherObject(res.records);
        resValue = typeof resValue === 'undefined' ? null : resValue;

        let err = null;

        if (typeof resValue === 'string' && resValue.startsWith(QUERY_RESULT_ERROR_PREFIX)) {
            err = new Error(resValue.slice((QUERY_RESULT_ERROR_PREFIX.length)));
            resValue = null;
        }

        return {value: resValue, err, bookmark: res.bookmark};
    }


    loadQueries() {
        Object.keys(queries).forEach((name) => {
            this[name] = async (...args) => this.performQuery(name, ...args);
            this[`${name}Builder`] = (traversal, ...args) => ([...traversal, queries[name].generateQuery(...args)]);
            this[`${name}Executor`] = async (...args) => this.querySessionWrapper(queries[name], 'resultFunc', queries[name].transaction, ...args);
        });
    }

}

module.exports = Neo4jManager;