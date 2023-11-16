define(['microcore', 'mst!leads/list/item', "/app/modules/confirm", "/app/modules/notify", "scripts", "app/modules/suggests"],
  function (mc, item_view, confirm, notify, scripts) {
      let filter = {}, hash;
      let page = 1;
      let profile = mc.auth.get();

      if (profile.role === 'webmaster') {
          filter.user_id = parseInt(profile.id);
      }

      mc.events.on('leads.filter.period.change', data => {
          if (data.value === '') {
              delete filter.timestamp;
              delete hash.period;
          } else {
              filter.timestamp = data.period;
              hash.period = data.value;
          }
      })

      mc.events.on('leads.filter.change', async (selected) => {
          filter[selected.name] = +selected.value || undefined;
      });

      mc.events.on('leads.remove', async (id) => {
          //await mc.api.call("leads.remove", {id: id});
          //await mc.events.push('leads.filter.apply', $('div.list[handler]')[0])
      });

      mc.events.on('leads.filter.apply', async ($scope) => {
          filter.offset = (page - 1) * filter.limit;
          let leads = await mc.api.call("leads.list", filter);
          console.log(leads);
          $($scope).find('table > tbody').html('');
          leads = {
              items: [
                  {
                      id: 1,
                      timestamp: '07.02.2021 12:10',
                      offer: 'Банкротство / Москва',
                      record: 'https://api.botto.ai/upload/15/13/15/c691d55e.mp3',
                      phone: 79200459292,
                      status: 'new',
                      comment: 'Перезвонить этому ебалаю в понедельник'
                  }
              ],
              total: 1000,
              limit: 50,
              sold: 3213,
              free: 2121
          }
          if (leads.items.length) {
              for (let i in leads.items) {
                  let item = leads.items[i];
                  item.profile = profile;
                  $($scope).find('table > tbody').append(await item_view(item))
              }
          } else {
              $($scope).find('table > tbody').html(`<td colspan='8'><div class=\"loader\">${mc.i18n('table.empty')}</div></td>`)
          }

          mc.events.push('leads:stats.update', {
              total: leads.total,
              sold: leads.sold,
              free: leads.total - leads.sold
          });

          mc.events.push('system:pagination.update', {
              id: 'leads',
              total: leads.total,
              limit: leads.limit,
              current: page,
              sold: leads.sold,
              free: leads.total - leads.sold,
              stats: [{
                  name: mc.i18n('leads.sold'),
                  value: leads.sold
              }, {
                  name: mc.i18n('leads.free'),
                  value: leads.free
              }]
          })
      });

      mc.events.on('leads.filter.reset', async ($scope) => {
          mc.router.go('/leads/');
      });

      mc.events.on("leads.filter.filter", async ($scope) => {
          hash.page = 1;
          for (let k in filter) {
              if (filter[k] === undefined) {
                  delete filter[k];
              }
          }
          console.log(filter);
          mc.router.go(mc.router.hash(hash));
      });

      return async ($scope, $params) => {
          hash = mc.router.hash();
          // filter = hash;
          page = parseInt(hash.page) || 1;
          filter.limit = parseInt(hash.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter = {
              ...filter,
              ...hash
          }
          if (hash.period) {
              filter.timestamp = scripts.setTimestamp(hash.period);
              delete filter.period;
          }
          console.log(filter);

          await mc.events.push('leads.filter.apply', $scope)
      }
  });