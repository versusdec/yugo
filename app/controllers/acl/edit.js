define(
    ["microcore", "mst!/acl/edit", "mst!/acl/record", "app/modules/notify"],
    function (mc, view, record_view, notify
    ) {
        let item = {}

        function field_error(field, tab) {
            $('ul.tabs li a')[tab].click()
            $(field).addClass('error')
            setTimeout(() => {
                $(field).removeClass('error')
            }, 3000)
            return false
        }

        mc.events.on('sys:page.init:acl/edit', () => {
            $('button[data-type]').on('click', (e) => {
                let type = e.target.dataset.type

                if (type === 'next') {
                    let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                    $next.removeClass('disabled')
                    return $next.find('a')[0].click()
                }

                if (!item.role.length || item.role === "new") {
                    notify('Выберите роль');
                    return false
                }

                item.grants = {};
                document.querySelectorAll('#acl_grants tr[data-method]').forEach((el, i) => {
                    let checked = el.querySelector('input[type=checkbox]').checked?1:0;
                    item.grants[el.dataset.method] = {name: el.dataset.name, method: el.dataset.method, granted: checked};
                });

                mc.api.call('acl.' + type, item).then((res) => {
                    switch (type) {
                        case 'add':
                            if (res) {
                                notify('Запись создана', 'Запись "' + item.name + '" успешно создана')
                            } else {
                                notify('Произошла ошибка')
                            }
                            break;
                        case 'update':
                            if (res) {
                                notify('Запись обновлена', 'Запись #'+item.role+' успешно обновлена')
                            } else {
                                notify('Запись не изменилась', 'Запись #'+item.role+' не была изменена')
                            }

                            break;
                    }

                    mc.router.go('/acl/')
                })
            })
        });

        mc.events.on('acl.grants.add', async (button) => {
            let name = button.closest('div').querySelector('input[name=name]').value,
                method = button.closest('div').querySelector('input[name=method]').value;
            if (name && name.length && method && method.length){
                if (!$('#acl_grants tr[data-method="'+method+'"]').length) {
                    $('#acl_grants tbody').append(await record_view({name:name, method: method}));
                    button.closest('div').querySelector('input[name=name]').value = "";
                    button.closest('div').querySelector('input[name=method]').value = "";
                }
            }
        });


        return async function (params) {
            let title = 'Создать шаблон ACL'

            if (params.role == 'new') {
                document.title = "Создание | ACL | Yugo Platform";
                item = {role: "new"}
            } else {
                document.title = "Редактирование | ACL | Yugo Platform";
                item = await mc.api.call('acl.get', {role: params.role})
                title = 'Редактирование шаблона ACL'
            }
            let data = {
                item: item
            }

            data.title = title;
            data.roles = [
                {option: 'Владелец сети', value: 'network_owner'},
                {option: 'Менеджер сети', value: 'network_manager'},
                {option: 'Администратор агентства', value: 'agency_admin'},
                {option: 'Менеджер агентства', value: 'agency_manager'},
                {option: 'Рекламодатель', value: 'merchant'},
                {option: 'Вебмастер', value: 'webmaster'},
            ]

            data.role_change = (selected) => {
                item.role = selected.value
            }

            return view(data);
        }
    });