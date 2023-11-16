define(
    ["microcore", "mst!/regions/edit", "app/modules/notify", "app/modules/suggests"],
    function (mc, view, notify
    ) {
        let item = {}

        mc.events.on('region.network.change', async (selected) => {
            item.network_id = parseInt(selected.value) || undefined;
            $('input[name="agency_id"]')[0].value = "";
            $('input[name="agency_id"]')[0].dataset.value = ""
            $('input[name="agency_id"]')[0].closest('.autocomplete').querySelector('.options').innerHTML = "";
        });
        mc.events.on('region.agency.change', async (selected) => {
            item.agency_id = parseInt(selected.value) || undefined;
        });

        mc.events.on('sys:page.init:regions/edit', () => {
            $('button[data-type]').on('click', (e) => {
                let type = e.target.dataset.type
                item.name = $('input[name=name]').val()

                if (!parseInt(item.network_id)>=0){
                    notify('Не указана сеть', 'Укажите сеть региона')
                    return false
                }
                if (!parseInt(item.agency_id)>=0){
                    notify('Не указано агентство', 'Укажите агентство региона')
                    return false
                }

                mc.api.call('regions.' + type, item).then((res) => {
                    switch (type) {
                        case 'create':
                            notify('Регион создан', 'Регион "'+item.name+'" успешно создан')
                            break;
                        case 'update':
                            if (res) {
                                notify('Регион обновлен', 'Регион #'+item.id+' успешно обновлен')
                            } else {
                                notify('Регион не изменился', 'Регион #'+item.id+' не был изменен')
                            }

                            break;
                    }

                    mc.router.go('/regions/')
                })
            })
        })


        return async function (params) {
            let title = 'Создать регион'

            if (params.id == 'new') {
                document.title = "Создание | Региона | Yugo Platform";
                item = {
                    name: "",
                    status: "active"
                }
            } else {
                document.title = "Редактирование | Региона | Yugo Platform";
                item = await mc.api.call('regions.get', {id: params.id})
                title = 'Редактирование региона'
            }
            let data = {
                item: item,
                id: params.id
            }

            data.title = title

            data.statuses = [
                {option: 'активен', value: 'active'},
                {option: 'архивный', value: 'archived'}
            ]

            data.status_change = (selected) => {
                item.status = selected.value
            }

            data.network_set = async (id) => {
                let item = await mc.api.call('networks.get', {id: id});
                return {
                    option: item.name + ' - ' + item.status,
                    value: item.id
                }
            }
            data.agency_set = async (id) => {
                let item = await mc.api.call('agencies.get', {id: id});
                return {
                    option: item.name + ' - ' + item.status,
                    value: item.id
                }
            }

            return view(data);
        }
    });