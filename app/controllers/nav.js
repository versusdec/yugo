define(['microcore'], function (mc) {
    return async ($scope, $params) => {
        let max_length = 0
        let selected = null
       /* $($scope).find('a').each((i, el) => {
            let link = $(el).attr('href').toString();
            if (location.pathname.match(link)) {
                if (link.length > max_length) {
                    selected = el
                    max_length = link.length
                }
            }
        })*/

        $($scope).find('a.active').removeClass('active')
        if (selected) {
            $(selected).addClass('active')
        }

        $($scope).find('a').on('click', (e) => {
            $($scope).find('a.active').removeClass('active')
            $(e.target).addClass('active')
        })
    }
});