define(['microcore', 'mst!acl/item', "/app/modules/confirm", "/app/modules/notify"],
    function (mc, item_view, confirm, notify) {

        return async ($scope, $params) => {
            let hash_params = mc.router.hash()
            let page = parseInt(hash_params.page) || 1
            let limit = parseInt(hash_params.limit) || 10

            let acl = await mc.api.call("acl.list", {
                limit: limit,
                offset: (page-1) * limit
            })

            if (acl.items.length) {
                $($scope).find('table > tbody').html('')
                for (let i in acl.items) {
                    let item = acl.items[i]
                    $($scope).find('table > tbody').append(await item_view(item))
                }
            } else {
                $($scope).find('table > tbody .loader').text("нет записей")
            }

            mc.events.push('system:pagination.update', {
                id: 'acl',
                total: acl.total,
                limit: acl.limit,
                current: page
            })
        }
    });