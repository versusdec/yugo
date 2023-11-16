define(
    ["microcore", "mst!/agencies/edit", "mst!/agencies/record", "app/modules/notify", "app/modules/suggests"],
    function (mc, view, record_view, notify
    ) {
        let item = {}

        mc.events.on('agency.network.change', async (selected) => {
            item.network_id = parseInt(selected.value) || undefined;
        });
        mc.events.on('agency.master.change', async (selected) => {
            item.master_id = parseInt(selected.value) || undefined;
        });
        mc.events.on('agency.admin.change', async (selected) => {
            if (selected.value && selected.value.length) {
                mc.api.call("users.get", {id: selected.value}).then(async (res) => {
                    if (res && res.id) {
                        if (!$('#agency_admins tr[data-id="' + res.id + '"]').length) {
                            $('#agency_admins tbody').append(await record_view(res));
                        }
                    }
                });
            }
        });
        mc.events.on('agency.manager.change', async (selected) => {
            if (selected.value && selected.value.length) {
                mc.api.call("users.get", {id: selected.value}).then(async (res) => {
                    if (res && res.id) {
                        if (!$('#agency_managers tr[data-id="' + res.id + '"]').length) {
                            $('#agency_managers tbody').append(await record_view(res));
                        }
                    }
                });
            }
        });
        mc.events.on('agency.merchant.change', async (selected) => {
            if (selected.value && selected.value.length) {
                mc.api.call("users.get", {id: selected.value}).then(async (res) => {
                    if (res && res.id) {
                        if (!$('#agency_merchants tr[data-id="' + res.id + '"]').length) {
                            $('#agency_merchants tbody').append(await record_view(res));
                        }
                    }
                });
            }
        });
        mc.events.on('agency.webmaster.change', async (selected) => {
            if (selected.value && selected.value.length) {
                mc.api.call("users.get", {id: selected.value}).then(async (res) => {
                    if (res && res.id) {
                        if (!$('#agency_webmasters tr[data-id="' + res.id + '"]').length) {
                            $('#agency_webmasters tbody').append(await record_view(res));
                        }
                    }
                });
            }
        });

        mc.events.on('sys:page.init:agencies/edit', () => {
            $('button[data-type]').on('click', (e) => {
                let type = e.target.dataset.type
                if (type === 'next') {
                    let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                    $next.removeClass('disabled')
                    return $next.find('a')[0].click()
                }

                item.name = $('input[name=name]').val()

                if (!item.network_id){
                    notify('Не указана сеть', 'Укажите сеть агентства')
                    return false
                }
                if (!item.master_id){
                    notify('Не указан владелец', 'Укажите владельца агентства')
                    return false
                }

                let admins = [];
                document.querySelectorAll('#agency_admins tr[data-id]').forEach((el, i) => {
                    admins.push(Number(el.dataset.id));
                });
                let managers = [];
                document.querySelectorAll('#agency_managers tr[data-id]').forEach((el, i) => {
                    managers.push(Number(el.dataset.id));
                });
                let merchants = [];
                document.querySelectorAll('#agency_merchants tr[data-id]').forEach((el, i) => {
                    merchants.push(Number(el.dataset.id));
                });
                let webmasters = [];
                document.querySelectorAll('#agency_webmasters tr[data-id]').forEach((el, i) => {
                    webmasters.push(Number(el.dataset.id));
                });

                mc.api.call('agencies.' + type, item).then((res) => {
                    switch (type) {
                        case 'add':
                            if (res) {
                                notify('Агентство создано', 'Агентство "' + item.name + '" успешно создано')
                                mc.api.call('agencies.admins.update', {agency_id: res, users: admins}).then((res) => {
                                    if (!res){
                                        notify('Произошла ошибка при сохрании списка администраторов')
                                    }
                                });
                                mc.api.call('agencies.managers.update', {agency_id: res, users: managers}).then((res) => {
                                    if (!res){
                                        notify('Произошла ошибка при сохрании списка менеджеров')
                                    }
                                });
                                mc.api.call('agencies.merchants.update', {agency_id: res, users: merchants}).then((res) => {
                                    if (!res){
                                        notify('Произошла ошибка при сохрании списка рекламодателей')
                                    }
                                });
                                mc.api.call('agencies.webmasters.update', {agency_id: res, users: webmasters}).then((res) => {
                                    if (!res){
                                        notify('Произошла ошибка при сохрании списка вебмастеров')
                                    }
                                });
                            } else {
                                notify('Произошла ошибка')
                            }
                            break;
                        case 'update':
                            if (res) {
                                notify('Агентство обновлено', 'Агентство #'+item.id+' успешно обновлено')
                            } else {
                                //notify('Агентство не изменилось', 'Агентство #'+item.id+' не было изменено')
                            }
                            mc.api.call('agencies.admins.update', {agency_id: item.id, users: admins}).then((res) => {
                                if (!res){
                                    notify('Произошла ошибка при сохрании списка администраторов')
                                }
                            });
                            mc.api.call('agencies.managers.update', {agency_id: item.id, users: managers}).then((res) => {
                                if (!res){
                                    notify('Произошла ошибка при сохрании списка менеджеров')
                                }
                            });
                            mc.api.call('agencies.merchants.update', {agency_id: item.id, users: merchants}).then((res) => {
                                if (!res){
                                    notify('Произошла ошибка при сохрании списка рекламодателей')
                                }
                            });
                            mc.api.call('agencies.webmasters.update', {agency_id: item.id, users: webmasters}).then((res) => {
                                if (!res){
                                    notify('Произошла ошибка при сохрании списка вебмастеров')
                                }
                            });
                            break;
                    }

                    mc.router.go('/agencies/')
                })
            })
        })


        return async function (params) {
            let title = 'Создать агентство'

            if (params.id == 'new') {
                document.title = "Создание | Агентства | Yugo Platform";
                item = {
                    name: "",
                    status: "active"
                }
            } else {
                document.title = "Редактирование | Агентства | Yugo Platform";
                item = await mc.api.call('agencies.get', {id: params.id})
                title = 'Редактирование агентства'
            }
            let data = {
                item: item,
                id: params.id
            }

            data.title = title;
            data.statuses = [
                {option: 'активен', value: 'active'},
                {option: 'заблокирован', value: 'blocked'},
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
            data.master_set = async (id) => {
                let item = await mc.api.call('users.get', {id: id});
                return {
                    option: item.name + item.surname + '('+item.email+')' + ' - ' + item.status,
                    value: item.id
                }
            }

            return view(data);
        }
    });