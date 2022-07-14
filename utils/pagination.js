//分页模型
var pagination = {
    createPagination: function (total, currentPage = 1, itemsPerPage = 10) {
        var pagination = {}
        pagination.totalItems = total//总记录数
        pagination.currentPage = currentPage//当前页码
        pagination.itemsPerPage = itemsPerPage//每页显示记录数
        pagination.pages = function () {

            if (this.totalItems % this.itemsPerPage === 0) return this.totalItems / this.itemsPerPage
            if (this.totalItems < this.itemsPerPage) return 1
            return Math.floor(this.totalItems / this.itemsPerPage) + 1

        }
        return pagination
    }
}

module.exports = pagination