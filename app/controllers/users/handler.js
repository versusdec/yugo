define(['microcore', 'mst!users/item', "/app/modules/confirm", "/app/modules/notify"], function (mc, item_view, confirm, notify) {

    mc.events.on("users.switch", (user_id) => {
        mc.api.call("auth.switch", {id: user_id}).then((res) => {
            if (res){
                location.href = "/";
            } else {
                notify('Произошла ошибка')
            }
        });
    });

    return async ($scope, $params) => {
        let hash_params = mc.router.hash()
        let page = parseInt(hash_params.page) || 1
        let limit = parseInt(hash_params.limit) || 10

        let type = $params.type.substr(0,$params.type.length-1)
        let users = await mc.api.call("users.list", {
            role: type.length>0?type:undefined,
            limit: limit,
            offset: (page-1) * limit
        })

        if (users.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in users.items) {
                let item = users.items[i];

                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет пользователей")
        }

        mc.events.push('system:pagination.update', {
            id: 'users',
            total: users.total,
            limit: users.limit,
            current: page
        })
    }
});