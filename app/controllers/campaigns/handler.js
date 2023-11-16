define(['microcore', 'mst!campaigns/item', "/app/modules/confirm", "/app/modules/notify", "app/modules/suggests"],
    function (mc, item_view, confirm, notify) {

        let page = 1,
            filter = {
                limit: 10
            },
            profile = mc.auth.get();

        mc.events.on('campaigns.remove', (tag) => {
            confirm('Удалить кампанию?', '', () => {
                mc.api.call('campaigns.remove', {id: parseInt(tag.id)}).then(res => {
                    if (res) {
                        notify('Кампания удалена', 'Кампания "' + tag.name + '" успешно удалена');
                        mc.router.go('/campaigns/')
                    } else
                        notify('Произошла ошибка')
                })
            })
        });

        async function suggest(method, params, cb) {
            let data = await mc.api.call(method, params);

            let items = [];

            for (let i in data.items) {
                let item = data.items[i];
                if (typeof cb == 'function') {
                    items.push(cb(item))
                } else {
                    items.push({
                        option: item.name,
                        value: item.id
                    })
                }

            }

            return items
        }

        mc.events.on('campaigns.filter.name.change', async (input) => {
            filter.name = input.value;
        });
        mc.events.on('campaigns.filter.webmasters.change', async (selected) => {
            filter.webmaster_id = parseInt(selected.value)||undefined;
        });
        mc.events.on('campaigns.filter.category.change', async (selected) => {
            filter.category_id = parseInt(selected.value)||undefined;
        });
        mc.events.on('campaigns.filter.offer.change', async (selected) => {
            filter.offer_id = parseInt(selected.value)||undefined;
        });
        mc.events.on('campaigns.filter.status.change', async (selected) => {
            filter.status = selected.value;
        });

        mc.events.on('campaigns.filter.apply', async ($scope) => {
            filter.offset = (page-1) * filter.limit;
            let campaigns = await mc.api.call("campaigns.list", filter)
            $($scope).find('table > tbody').html('')
            if (campaigns.items.length) {
                for (let i in campaigns.items) {
                    let item = campaigns.items[i];
                    item.profile = mc.auth.get()

                    $($scope).find('table > tbody').append(await item_view(item))
                }
            } else {
                $($scope).find('table > tbody .loader').text("нет кампаний")
            }

            mc.events.push('system:pagination.update', {
                id: 'campaigns',
                total: campaigns.total,
                limit: campaigns.limit,
                current: page
            })

            $('#campaigns-stats span[data-total]').text(campaigns.total);
        });

        mc.events.on('campaigns.filter.reset', async ($scope) => {
            mc.router.go('/campaigns/');
        });

        mc.events.on("campaigns.filter.filter", async ($scope) => {
            filter.page = 1;
            for (let k in filter){
                if (filter[k] === undefined){
                    delete filter[k];
                }
            }
            mc.router.go(mc.router.hash(filter));
        });

        return async ($scope, $params) => {
            let hash_params = mc.router.hash();
            filter = hash_params;
            page = parseInt(hash_params.page) || 1;
            filter.limit = parseInt(hash_params.limit) || 10;
            filter.offset = (page-1) * filter.limit;

            await mc.events.push('campaigns.filter.apply', $scope)
        }
});