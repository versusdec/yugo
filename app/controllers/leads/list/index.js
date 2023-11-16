define(
  ["microcore", "mst!/leads/list/index"],
  function (mc, view
  ) {

      mc.events.on('leads:stats.update', (data) => {
          for (let key in data) {
              let value = data[key]
              // $('span[data-' + key + ']').text(value)
          }
      })

      return function (params) {
          document.title = `${mc.i18n('leads.title')} | Yugo Platform`;
          let hash = mc.router.hash();
          let data = {
              title: mc.i18n('leads.title'),
              tab: location.pathname.split('/')[1],
              profile: mc.auth.get(),
              leads_filter: mc.router.hash(),
              region_set: async (id) => {
                  let item = await mc.api.call('regions.get', {id: id});
                  return {
                      option: item.name,
                      value: item.id
                  }
              },
              category_set: async (id) => {
                  let item = await mc.api.call('categories.get', {id: id});
                  return {
                      option: item.name,
                      value: item.id
                  }
              },
              source_set: async (id) => {
                  let item = await mc.api.call('sources.get', {id: id});
                  return {
                      option: item.name,
                      value: item.id
                  }
              },
              webmaster_set: async (id) => {
                  let item = await mc.api.call('users.get', {id: id});
                  return {
                      option: item.name + ' ' + item.surname + ' (' + item.email + ') - ' + item.status,
                      value: item.id
                  }
              },
              tag_set: async (id) => {
                  let item = await mc.api.call('tags.get', {id: id});
                  return {
                      option: item.name,
                      value: item.id
                  }
              }
          }

          if (hash.period)
              data.period = hash.period

          return view(data);
      }
  });