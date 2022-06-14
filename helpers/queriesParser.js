const { release } = require("os");

const descending = "desc";
const ascending = "asc";

const EqualTo = "=";
const GreaterThan = ">";
const GreaterThanOrEqualTo = ">=";
const LessThanOrEqualTo = "<=";
const NotEqualTo = "<>";
const LessThan = "<";

const All = "all";
const And = "and";
const Any = "any";

const Between = "between";
const Exists = "exists";

const In = "in";
const Like = "like";
const Not = "not";
const Or = "or";
const Some = "some";

module.exports.queriesParser = function (filters) {
  let orQueries = [];
  let arg = [];
  let indexOfArg = 1;
  for (let orFilters of filters) {
    let andQueries = [];
    for (let andFilter of orFilters) {
      switch (andFilter.operator) {
        case "EqualTo":
          andQueries.push(`${andFilter.column} ${EqualTo} $${indexOfArg} `);
          arg.push(andFilter.value);
          indexOfArg++;
          break;
        case "GreaterThan":
          andQueries.push(`${andFilter.column} ${GreaterThan} $${indexOfArg} `);
          arg.push(andFilter.value);
          indexOfArg++;
          break;
        case "GreaterThanOrEqualTo":
          andQueries.push(
            `${andFilter.column} ${GreaterThanOrEqualTo} $${indexOfArg} `
          );
          arg.push(andFilter.value);
          indexOfArg++;
          break;
        case "LessThanOrEqualTo":
          andQueries.push(
            `${andFilter.column} ${LessThanOrEqualTo} $${indexOfArg} `
          );
          arg.push(andFilter.value);
          indexOfArg++;
          break;
        case "NotEqualTo":
          andQueries.push(`${andFilter.column} ${NotEqualTo} $${indexOfArg} `);
          arg.push(andFilter.value);
          indexOfArg++;
          break;
        case "LessThan":
          andQueries.push(`${andFilter.column} ${LessThan} $${indexOfArg} `);
          arg.push(andFilter.value);
          indexOfArg++;
          break;
        case "Like":
          andQueries.push(`${andFilter.column} ${Like} $${indexOfArg} `);
          arg.push(`%${andFilter.value}%`);
          indexOfArg++;
          break;
        default:
          break;
      }
    }
    //console.log(andQueries);
    orQueries.push(` ( ${andQueries.join(" and ")} ) `);

    //console.log("orQueries", orQueries);
  }
  let query = orQueries.join(" or ");

  //console.log(andQueries);

  return { query, arg };
};
