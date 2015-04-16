exports.generate = function(query) {
  return JSON.stringify({
    model: query.model.modelName,
    op: query.op,
    conditions: query._conditions,
    populate: query._mongooseOptions.populate,
    fields: query._fields,
    options: query.options
  });
};
