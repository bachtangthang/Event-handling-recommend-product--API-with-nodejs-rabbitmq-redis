exports.paging = function (offset, limit, data) {
  let result = [];
  console.log("data trong paging: ", data);
  for (let i = limit * (offset - 1); i < limit * offset; i++) {
    if (typeof data[i] !== "undefined") {
      result.push(data[i]);
    }
  }
  return result;
};
