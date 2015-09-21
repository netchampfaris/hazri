angular.module('hazri.filters', [])

.filter('batch', function () {
    return function (arr, b) {
        if (b.pr)
            return arr.slice(b.start-1, b.end);
        else
            return arr;
    };
});