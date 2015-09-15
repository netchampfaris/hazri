angular.module('hazri.filters', [])

.filter('batch', function () {
    return function (input, binfo) {
        var out = [];
        if (!binfo.pr)
            for (var i = 0; i < input.length; i++)
                out.push(input[i]);
        else if(binfo.pr)
                for (var i = binfo.bstart -1; i < binfo.bend; i++)
                    out.push(input[i]);

        return out;
    }
});