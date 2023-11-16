define([
    'microcore',
    'mst!tags/item',
    "/app/modules/confirm",
    "/app/modules/notify"], function (mc, item_view, confirm, notify) {

    mc.events.on('tags.remove', (tag) => {
        confirm('Удалить тэг?', tag.name, () => {
            mc.api.call('tags.remove', {id: parseInt(tag.id)}).then(res => {
                if (res) {
                    notify('Тэг удален', 'Тэг "' + tag.name + '" успешно удален');
                    mc.router.go('/tags/')
                } else
                    notify('Произошла ошибка', 'Тэг используется')
            })
        })
    });

    return async ($scope, $params) => {
        let hash_params = mc.router.hash()
        let page = parseInt(hash_params.page) || 1
        let limit = parseInt(hash_params.limit) || 10

        let tags = await mc.api.call("tags.list", {
            limit: limit,
            offset: (page - 1) * limit
        })

        if (tags && tags.items && tags.items.length) {
            $($scope).find('table > tbody').html('')
            for (let i in tags.items) {
                let item = tags.items[i]
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('table > tbody .loader').text("нет тэгов")
        }

        mc.events.push('system:pagination.update', {
            id: 'tags',
            total: tags.total,
            limit: tags.limit,
            current: page
        })
    }
});