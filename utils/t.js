const pagination = require("./pagination");

const p = pagination.createPagination(83, 2, 9)
console.log(p.totalItems, p.currentPage, p.pages())