function deconstructCypherObject(records, i = 0) {
    const arrayOriginally = Array.isArray(records);
    let resValue = arrayOriginally ? records : [records];
    resValue = resValue.map((m) => {
        const converted = extractNodeProperties(m);
        if (converted && typeof converted === 'object') {
            Object.keys(converted).forEach((k) => {
                converted[k] = deconstructCypherObject(extractNodeProperties(converted[k]), i + 1);
            });
        }
        return converted;
    });
    return (resValue.length > 1 || (arrayOriginally && i > 0)) ? resValue : resValue[0];
}

function extractNodeProperties(obj) {
    if (typeof obj !== 'object' || !obj || Array.isArray(obj)) {
        return obj;
    }
    if (obj.values) {
        const recordValues = [...obj.values()];
        return extractNodeProperties(recordValues.length === 1 ? recordValues[0] : recordValues);
    }
    if (obj.properties) {
        return obj.properties;
    }
    return obj;
}

module.exports = {
    deconstructCypherObject
}