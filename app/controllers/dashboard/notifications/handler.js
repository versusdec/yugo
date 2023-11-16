define(['microcore', 'mst!dashboard/components/notifications/item'], function (mc, item_view) {
    return async function ($scope, $params) {
        let hash_params = mc.router.hash();
        let page = parseInt(hash_params.page) || 1;
        let limit = parseInt(hash_params.limit) || 10;
        let user = await mc.api.call('users.me');

        mc.api.call("users.notifications.list", {
            status: 'new',
            limit: 3
        }).then(async function (notifications) {
            if (notifications && notifications.items && notifications.items.length) {
                $($scope).find('.loader').remove()
                for (let i in notifications.items) {
                    let item = notifications.items[i];

                    $($scope).find('.list').append(await item_view(item))
                }
            } else {
                $($scope).find('.loader').text("нет уведомлений")
            }

            mc.events.push('system:pagination.update', {
                total: notifications.total,
                limit: notifications.limit,
                current: page
            })
        })
    }
});