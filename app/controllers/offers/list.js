define(
  ["microcore", "mst!/offers/list"],
  function (mc, view
  ) {
      return async function (params) {
          document.title = `${mc.i18n('offers.title')} | Yugo Platform`;
          let title = mc.i18n('offers.title');

          return view({
              title: title,
              role: mc.auth.get().role,
              types: [
                  {option: mc.i18n('status.lead'), value: 'lead'},
                  {option: mc.i18n('table.conversion'), value: 'conversion'},
                  // {option: mc.i18n('table.call'), value: 'call'},
              ],
              statuses: [
                  {option: mc.i18n('status.active'), value: 'active'},
                  {option: mc.i18n('status.blocked'), value: 'blocked'},
                  {option: mc.i18n('status.archived'), value: 'archived'},
              ],
              filter: mc.router.hash(),
              merchant_set: async (id) => {
                  let item = await mc.api.call('users.get', {id: id});
                  if (item)
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
              }
          });
      }
  });