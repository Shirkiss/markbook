const neo4j = require('neo4j-driver');

const NOT_FOUND = -1;
const INLINE_PARAM_TYPE = 'inline';
const TRANSACTION_TYPE = {
  READ: 'readTransaction',
  WRITE: 'writeTransaction',
};
const EXECUTION_MODE = {
  BATCH: 'BATCH',
  SEQUENTIAL: 'SEQUENCE',
};

const DEFAULT_TIMEOUT = 1000;

function inlineParam(value) {
  return { type: INLINE_PARAM_TYPE, value };
}

class CypherQuery {
  constructor() {
    this.resultFunc = this.constructor.resultFunc;
    this.newTransaction = this.constructor.newTransaction;
  }

  get required() {
    return ['id'];
  }

  get optional() {
    return [];
  }

  static get executionMode() {
    return EXECUTION_MODE.BATCH;
  }

  static get transaction() {
    return TRANSACTION_TYPE.WRITE;
  }

  static get timeout() {
    return DEFAULT_TIMEOUT;
  }

  static get metadataProps() {
    return ['id'];
  }

  static getConfig(params) {
    const metadata = {};
    for (let i = 0; i < this.metadataProps.length; i++) {
      const propName = this.metadataProps[i];
      metadata[propName] = params[propName];
    }
    return {
      timeout: this.timeout,
      metadata,
    };
  }

  fillProps(query, params, propertyLabel = undefined) {
    let newQuery = `${query} { `;
    const all = this.required.concat(this.optional);
    this.required.forEach((propName) => {
      if (!(propName in params)) throw new Error(`"${propName}" is required but missing in query params`);
    });
    const paramNames = Object.keys(params);
    paramNames.forEach((propName, i) => {
      if (!all.includes(propName)) {
        return;
      }
      const addedLabel = propertyLabel ? `${propertyLabel}.` : '';
      // Append property to query string
      const paramValue = params[propName];
      const paramValueInQuery = paramValue && paramValue.type === INLINE_PARAM_TYPE ? paramValue.value : `$${propName}`;
      newQuery += `${addedLabel}${propName}${propertyLabel ? ' = ' : ': '}${paramValueInQuery}${i < paramNames.length - 1 ? ', ' : ''}`;
    });
    if (newQuery.endsWith(', ')) {
      // For any case where the parameter list wasn't enclosed properly
      // eslint-disable-next-line no-magic-numbers
      newQuery = newQuery.slice(0, newQuery.length - 2);
    }
    newQuery += ' }';
    return newQuery;
  }

  static buildParams(params) {
    const parsedParams = params;
    Object.keys(params).forEach((paramName) => {
      const val = params[paramName];
      parsedParams[paramName] = (Number.isInteger(val) && String(val).indexOf('.') === NOT_FOUND) ? neo4j.int(val) : val;
    });
    return parsedParams;
  }

  generateQuery() {
    throw new Error('"generateQuery" not implemented.');
  }

  static async newTransaction(session, ...args) {
    return session[this.transactionType](...args);
  }

  static get transactionType() {
    return process.env.FORCE_WRITE_TRANSACTION === 'true' ? TRANSACTION_TYPE.WRITE : this.transaction;
  }

  get transactionType() {
    return process.env.FORCE_WRITE_TRANSACTION === 'true' ? TRANSACTION_TYPE.WRITE : this.transaction;
  }

  static async resultFunc(session, timeout, queryOrQueries) {
    const doRun = async (t, q, config) => {
      const result = await t.run(q.query, this.buildParams(q.params), config);
      return result && { records: result.records };
    };

    return this.newTransaction(session, async (txc) => {
      const arrayOriginally = Array.isArray(queryOrQueries);
      const queriesToRun = arrayOriginally ? queryOrQueries : [queryOrQueries];
      if (this.executionMode === EXECUTION_MODE.BATCH) {
        const results = await Promise.all(queriesToRun.map(q => doRun(txc, q, this.getConfig(q.params))));
        return arrayOriginally ? results : results[0];
      }
      let result;
      // eslint-disable-next-line no-restricted-syntax
      for (const q of queriesToRun) {
        // eslint-disable-next-line no-await-in-loop
        result = await doRun(txc, q, this.getConfig(q.params));
      }
      return result;
    });
  }

  /**
   * Performs a query against the provided session.
   * Implementation can execute one or more read/write transactions and return the result.
   * @param {*} session
   * @param {*} timeout The transaction timeout in milliseconds
   * @param  {...any} args Custom query-specific arguments
   * @returns When overriding, return { value, err } where 'err' is a string.
   * The default implementation uses 'generateQuery' that returns { records: [] } which will be processed by the 'deconstructCypherObject' method.
   */
  async perform(session, timeout, ...args) {
    const query = this.generateQuery(...args);

    return this.constructor.resultFunc(session, timeout, query);
  }
}

module.exports = { CypherQuery, inlineParam, TRANSACTION_TYPE, EXECUTION_MODE };
