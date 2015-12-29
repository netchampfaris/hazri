angular.module('hazri.filters', [])

.filter('batch', function () {
    return function (arr, b) {
        if (b.pr)
            return arr.slice(b.start-1, b.end);
        else
            return arr;
    };
})

.filter('orderObjectBy', function() {
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if(reverse) filtered.reverse();
        return filtered;
    };
});