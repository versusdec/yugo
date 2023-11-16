define(
  ["microcore", "mst!/merchants/list"],
  function (mc, view
  ) {
      let hash = {};

      mc.events.on("merchants.filter.filter", async ($scope) => {
          hash.page = 1;
          for (let k in hash) {
              if (hash[k] === undefined) {
                  delete hash[k];
              }
          }
          mc.router.go(mc.router.hash(hash));
      });

      return function (params) {
          document.title = `${mc.i18n('merchants.title')} | Yugo Platform`;
          hash = mc.router.hash();
          let data = {
              title: mc.i18n('merchants.title'),
              profile: mc.auth.get(),
              filter: mc.router.hash(),
              statuses: [{
                  option: mc.i18n('status.active'),
                  value: 'active'
              }, {
                  option: mc.i18n('status.blocked'),
                  value: 'blocked'
              }, {
                  option: mc.i18n('status.archived'),
                  value: 'archived'
              }],
              status_change: async (select) => {
                  hash.status = select.value;
              },
              date_change: async (select) => {
                  hash.registered = select.value;
              },
              merchant_set: async (id) => {
                  let item = await mc.api.call('agencies.merchants.get', {id: id});
                  return {
                      option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                      value: item.id
                  }
              },
              merchant_change: async (data) => {
                  console.log(data);
              }
          }

          return view(data);
      }
  });