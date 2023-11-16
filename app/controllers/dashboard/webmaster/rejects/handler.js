define(['microcore', 'mst!dashboard/webmaster/rejects/item'], function (mc, item_view) {

    return async function ($scope, $params) {
        mc.api.call("stats.sales.rejects", {

        }).then(async function (sales) {
            $($scope).find('tbody').html('');
            if (sales && sales.items && sales.items.length) {
                for (let i in sales.items) {
                    let item = sales.items[i];
                    $($scope).find('tbody').append(await item_view(item))
                }
            } else {
                $($scope).find('.loader').text("нет лидов")
            }
        })
    }
});