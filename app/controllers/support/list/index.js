define(["microcore", "mst!/support/list/index"],
  function (mc, view) {

      mc.events.on('support:stats.update',  (data) => {
          $('span[data-total]').text(data.total)
      })

    return async function (params) {
      document.title = "Поддержка | Yugo Platform";

      return view({
          tab: (params.tab == undefined)?'tech':params.tab,
          user: mc.auth.get(),
          statuses: [
              {
                  option: 'Открыто',
                  value: 'active'
              },
              {
                  option: 'Закрыто',
                  value: 'closed'
              }
          ],
          filter: mc.router.hash(),
          user_set: async (id) => {
              let item = await mc.api.call('users.get', {id: id});
              return {
                  option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                  value: item.id
              }
          }
      });
    }
  }
);