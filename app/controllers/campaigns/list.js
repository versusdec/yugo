define(
    ["microcore", "mst!/campaigns/list"],
    function (mc, view
    ) {
        return function (params) {
            document.title = "Кампании | Yugo Platform";
            let title = 'Кампании'

            return view({
                title: title,
                profile: mc.auth.get(),
                statuses: [
                    {option: 'Активен', value: 'active'},
                    {option: 'Заблокирован', value: 'inactive'}
                ],
                filter: mc.router.hash(),
                webmaster_set: async (id) => {
                    let item = await mc.api.call('users.get', {id: id});
                    return {
                        option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                        value: item.id
                    }
                },
                category_set: async (id) => {
                    let item = await mc.api.call('categories.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                },
                offer_set: async (id) => {
                    let item = await mc.api.call('offers.get', {id: id});
                    return {
                        option: item.name,
                        value: item.id
                    }
                }
            });
        }
    });