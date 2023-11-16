define(
    ["microcore", "mst!/networks/edit", "mst!/networks/record", "app/modules/notify", "app/modules/suggests"],
    function (mc, view, manager_view, notify
    ) {
        let item = {}

        mc.events.on('network.owner.change', async (selected) => {
            item.owner_id = parseInt(selected.value) || undefined;
        });
        mc.events.on('network.manager.change', async (selected) => {
            if (selected.value && selected.value.length) {
                mc.api.call("users.get", {id: selected.value}).then(async (res) => {
                    if (res && res.id) {
                        if (!$('#network_managers tr[data-id="' + res.id + '"]').length) {
                            $('#network_managers tbody').append(await manager_view(res));
                        }
                    }
                });
            }
        });

        mc.events.on('sys:page.init:networks/edit', () => {
            $('button[data-type]').on('click', (e) => {
                let type = e.target.dataset.type

                if (type === 'next') {
                    let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                    $next.removeClass('disabled')
                    return $next.find('a')[0].click()
                }

                item.name = $('input[name=name]').val()
                if (!item.owner_id){
                    notify('Не указан владелец', 'Укажите владельца сети')
                    return false
                }

                let managers = [];
                document.querySelectorAll('#network_managers tr[data-id]').forEach((el, i) => {
                    managers.push(Number(el.dataset.id));
                });

                mc.api.call('networks.' + type, item).then((res) => {
                    switch (type) {
                        case 'add':
                            if (res) {
                                notify('Сеть создана', 'Сеть "' + item.name + '" успешно создана')
                                mc.api.call('networks.managers.update', {network_id: item.id, users: managers}).then((res) => {
                                    if (!res){
                                        notify('Произошла ошибка при сохрании списка менеджеров')
                                    }
                                });
                            } else {
                                notify('Произошла ошибка при сохрании сети')
                            }
                            break;
                        case 'update':
                            if (res) {
                                notify('Сеть обновлена', 'Сеть #'+item.id+' успешно обновлена')
                            } else {
                                //notify('Сеть не изменилась', 'Сеть #'+item.id+' не был изменена')
                            }
                            mc.api.call('networks.managers.update', {network_id: item.id, users: managers}).then((res) => {
                                if (!res){
                                    notify('Произошла ошибка при сохрании списка менеджеров')
                                }
                            });
                            break;
                    }

                    mc.router.go('/networks/')
                })
            })
        })


        return async function (params) {
            let title = 'Создать сеть'

            if (params.id == 'new') {
                document.title = "Создание | Сети | Yugo Platform";
                item = {
                    name: "",
                    status: "active"
                }
            } else {
                document.title = "Редактирование | Сети | Yugo Platform";
                item = await mc.api.call('networks.get', {id: params.id})
                title = 'Редактирование сети'
            }
            let data = {
                item: item,
                id: params.id
            }

            data.title = title

            data.statuses = [
                {option: 'активен', value: 'active'},
                {option: 'заблокирован', value: 'blocked'},
                {option: 'архивный', value: 'archived'}
            ]

            data.status_change = (selected) => {
                item.status = selected.value
            }

            data.owner_set = async (id) => {
                let item = await mc.api.call('users.get', {id: id});
                return {
                    option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                    value: item.id
                }
            }

            return view(data);
        }
    });