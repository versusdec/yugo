define(
    ["microcore", "mst!/users/edit", "app/modules/notify", "app/modules/suggests"],
    function (mc, view, notify
) {
    let item = {};

    function field_error(field, tab) {
        $('ul.tabs li a')[tab].click()
        $(field).addClass('error')
        setTimeout(() => {
            $(field).removeClass('error')
        }, 3000)
        return false
    }

    mc.events.on("user.email.check", async (input) => {
        if (input.value && input.value.length){
            let exist = await mc.api.call("users.exist", {email: input.value});
            if (exist){
                notify('Пользователь существует', 'Пользователь с таким email уже существует')
                return field_error('input[name=email]', 0)
            }
        }
    });

    mc.events.on('sys:page.init:users/edit', () => {
        $('button[data-type]').on('click', (e) => {
            let type = e.target.dataset.type

            if (type === 'next') {
                let $next = $($('ul.tabs li.active')[0].nextElementSibling)
                $next.removeClass('disabled')
                return $next.find('a')[0].click()
            }

            item.email = $('input[name=email]').val()
            item.name = $('input[name=name]').val()
            item.surname = $('input[name=surname]').val()
            item.patronymic = $('input[name=patronymic]').val()
            item.phone = $('input[name=phone]').val().replace(/[^0-9]/, '')

            if (!item.settings){
                item.settings = {};
            }
            if (!item.settings.notifications){
                item.settings.notifications = {};
            }

            if (item.phone.length < 1) {
                item.phone = undefined
            }

            if (!item.email.match(/\S+@\S+\.\S+/)) {
                return field_error('input[name=email]', 0)
            }

            item.settings.telegram = $('input[name=telegram]').val();
            item.settings.notifications.new_leads = Number($('input[name=notifications_new_leads]')[0].checked);
            item.settings.notifications.appeals = Number($('input[name=notifications_appeals]')[0].checked);
            item.settings.notifications.autoapprove = Number($('input[name=notifications_autoapprove]')[0].checked);
            item.settings.notifications.review = Number($('input[name=notifications_review]')[0].checked);

            item.grants = {};
            document.querySelectorAll('#user_grants tr[data-method]').forEach((el, i) => {
                let checked = el.querySelector('input[type=checkbox]').checked?1:0;
                item.grants[el.dataset.method] = {name: el.dataset.name, method: el.dataset.method, granted: checked};
            });


            if (type === 'add') {
                item.password = $('input[name=password]').val()
                if (item.password.length < 6) {
                    return field_error('input[name=password]', 1)
                }
            } else {
                if (item.settings && item.settings.manager && item.settings.manager.id){
                    item.settings.manager = item.settings.manager.id;
                }

                let new_password = $('input[name=new_password]').val(),
                    repeat_password = $('input[name=repeat_password]').val();

                if (new_password !== ""){
                    if (new_password.length > 5 && repeat_password.length > 5 && new_password === repeat_password) {
                        item.password = new_password;
                    } else {
                        return field_error('input[name=repeat_password]', 1)
                    }
                }
            }

            mc.api.call('users.' + type, item).then((res) => {
                switch (type) {
                    case 'add':
                        if (Number(res)>0) {
                            notify(
                                'Пользователь создан',
                                'Пользователь "'+item.name+' '+item.surname+' ('+item.email+')" успешно создан'
                            )
                            mc.router.go('/users/')
                        } else {
                            notify('Произошла ошибка')
                        }
                        break;
                    case 'update':
                        if (Number(res)>0) {
                            notify('Пользователь обновлен', 'Пользователь #'+item.id+' успешно обновлен')
                        } else {
                            notify('Пользователь не изменился', 'Пользователь #'+item.id+' не был изменен')
                        }
                        mc.router.go('/users/')
                        break;
                }
            })
        })
    })

    return async function (params) {
        let title = 'Создать пользователя'
        let data = {id: params.id}
        if (params.id == 'new') {
            document.title = "Создание | Пользователи | Yugo Platform";
            item = {
                settings: {
                    role: 'merchant',
                    notifications: {
                        new_leads: 0,
                        appeals: 0,
                        autoapprove: 0,
                        review: 0
                    }
                },
                status: 'blocked'
            }
        } else {
            document.title = "Редактирование | Пользователи | Yugo Platform";
            item = await mc.api.call('users.get', {id: params.id})
            title = 'Редактирование пользователя'
        }

        data.title = title
        data.statuses = [
            {option: 'активен', value: 'active'},
            {option: 'заблокирован', value: 'blocked'}
        ]

        data.roles = [
            {option: 'администратор', value: 'admin'},
            {option: 'владелец сети', value: 'network_owner'},
            {option: 'менеджер сети', value: 'network_manager'},
            {option: 'администратор агентства', value: 'agency_admin'},
            {option: 'менеджер агентства', value: 'agency_manager'},
            {option: 'вебмастер', value: 'webmaster'},
            {option: 'рекламодатель', value: 'merchant'}
        ]

        data.genders = [
            {option: 'мужской', value: 'male'},
            {option: 'женский', value: 'female'}
        ]

        data.currencies = [
            {option: 'RUB', value: 'RUB'},
            {option: 'USD', value: 'USD'},
            {option: 'EUR', value: 'EUR'}
        ]

        data.item = item

        data.gender_change = (selected) => {
            item.gender = selected.value
        }

        data.status_change = (selected) => {
            item.status = selected.value
        }

        data.role_change = (selected) => {
            item.role = selected.value
        }

        data.manager_set = async (id) => {
            let item = await mc.api.call('users.get', {
                id: id
            });
            return {
                option: item.surname + ' ' +item.name,
                value: item.id
            }
        };
        data.manager_change = (selected) => {
            item.settings.manager = selected.value
        };
        data.currency_change = (selected) => {
            item.currency = selected.value;
        };

        return view(data);
    }
});