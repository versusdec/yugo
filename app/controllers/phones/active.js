define(['microcore', 'mst!phones/item', "/app/modules/confirm", "/app/modules/notify"], function (mc, item_view, confirm, notify) {

    return async ($scope, $params) => {
        let hash_params = mc.router.hash()
        let page = parseInt(hash_params.page) || 1
        let limit = parseInt(hash_params.limit) || 10;
        let profile = mc.auth.get();

        let phones = await mc.api.call("phones.list", {
            status: 'active',
            limit: limit,
            offset: (page-1) * limit
        })

        if (phones.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in phones.items) {
                let item = phones.items[i];
                item.profile = profile;
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет номеров")
        }

        mc.events.push('system:pagination.update', {
            id: 'phones',
            total: phones.total,
            limit: phones.limit,
            current: page
        })
    }
});