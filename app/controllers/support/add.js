define(["microcore", "mst!/support/add", "/app/modules/notify"],
  function (mc, view, notify) {

    let data = {};

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

    function field_error(field, tab) {
      // $('ul.tabs li a')[tab].click();
      $(field).addClass('error');
      setTimeout(() => {
        $(field).removeClass('error')
      }, 3000);
      return false
    }

    mc.events.on('ticket.users.change', async (selected) => {
      data.user_id = selected.value
    });

    mc.events.on('ticket.users.suggest', async (value) => {
      return await suggest('users.suggest', {q: value}, function (item) {
        return {
          option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
          value: item.id
        }
      })
    });

    mc.events.on("ticket.add", (button) => {
      let profile = mc.auth.get();
      if (!$('.select > .option > span').html().length) {
        return field_error('.select')
      } else if (!$('[name=name]').val().length) {
        return field_error('[name=name]')
      } else if (!$('[name=text]').val().length) {
        return field_error('[name=text]')
      } else {
        if (profile.role == "admin"){
          if (!data.user_id){
            return field_error('[name=user_id]')
          }
        }
        data.name = $('[name=name]').val();
        data.text = $('[name=text]').val();
        mc.api.call('support.create', data).then((res) => {
          if (res) {
            mc.router.go(`/support/ticket/${res}`)
          } else {
            notify("Произошла ошибка")
          }
        })
      }
    });

    mc.events.on("ticket.upload", (files) => {
      data.attachments = [];
      files.forEach(e => {
        data.attachments.push(e)
      });
    });

    return async function (params) {
      document.title = "Тех поддержка | Yugo Platform";
      const stats = await mc.api.call('support.stats');
      if (stats) {
        stats.common = stats.common / 60;
        stats.my_tickets = stats.my_tickets / 60;
      }

      return view({
        profile: mc.auth.get(),
        stats: stats,
        options: [
          {
            option: 'Технические вопросы',
            value: 'tech'
          },
          {
            option: 'Финансовые вопросы',
            value: 'finance'
          }
        ],
        onchange: (selected) => {
          data.theme = selected.value
        }
      });
    }
  });