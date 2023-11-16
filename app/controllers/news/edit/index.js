define(["microcore", "mst!/news/edit/index", "app/modules/notify"], function (mc, view, notify) {

  let id, item = {}, edit = false;

  function field_error(field, tab) {
    // $('ul.tabs li a')[tab].click()
    $(field).addClass('error');
    setTimeout(() => {
      $(field).removeClass('error')
    }, 3000);
    return false
  }

  mc.events.on('sys:page.init:news/edit/index', () => {
    $('button[data-type]').on('click', (e) => {
      let type = e.target.dataset.type;

      item.title = $('input[name=title]').val();
      if (!item.title.length) {
        return field_error('[name=title]')
      }
      item.description = $('[name=description]').val();
      if (!item.description.length) {
        return field_error('[name=description]')
      }
      item.text = $('[name=text]').val();
      if (!item.text.length) {
        return field_error('[name=text]')
      }
      mc.api.call('news.' + type, item).then((res) => {
        switch (type) {
          case 'create':
            if (Number(res)>0) {
              notify(
                  'Новость создана',
                  'Новость "' + item.title + '" успешно создана'
              );
              mc.router.go('/news/')
            } else {
              notify('Произошла ошибка')
            }
            break;
          case 'update':
            if (Number(res)>0) {
              notify('Новость обновлена', 'Новость #' + item.id + ' успешно обновлена')
            } else {
              notify('Новость не изменилась', 'Новость #' + item.id + ' не была изменена')
            }
            mc.router.go('/news/')
            break;
        }
      })
    })
  });

  return async function (params) {
    document.title = "Новости | Yugo Platform";
    id = parseInt(params.id);
    let date = '';
    if (!!!id) {
      let today = new Date(), y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate();
      date = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
      item = {
        role: 'public',
        date: date,
      };
    } else {
      edit = true;
      item = await mc.api.call('news.get', {id: id});
    }

    let data = {
      item: item,
      edit: edit,
      date_change: (select) => {
        item.date = select.value
      },
      role_change: (select) => {
        item.role = select.value;
      },
      status_change: (select) => {
        item.status = select.value
      },
      roles: [
        {option: 'Все', value: 'public'},
        {option: 'Администратор', value: 'admin'},
        {option: 'Рекламодатель', value: 'merchant'},
        {option: 'Вебмастер', value: 'webmaster'},
      ],
      statuses: [
        {option: 'Активная', value: 'active'},
        {option: 'Архив', value: 'archived'},
      ]
    };

    return view(data);
  }
});