define(['microcore', 'mst!/dashboard/agency/stats/item', "popup"],
  function (mc, item_view, popup) {

      let filter = {};

      mc.events.on('sys:page.init:controllers/dashboard/agency/stats/list', () => {
          console.log('init')
      })

      mc.events.on('dashboard.agency.stats.list', async ($scope) => {
          let data = await mc.api.call("some.motherfucking.request", {});
          $($scope).find('table > tbody').html('');
          data = {
              items: [
                  {
                      id: 1,
                      timestamp: '07.02.2021',
                      shows: 23,
                      clicks: 12,
                      conversions: 15,
                      confirmed: 2,
                      pending: 4,
                      cr: 65,
                      spent: 10524,
                      income: 8545,
                      net_income: 2000,
                      hold: 843
                  }
              ],
              total: 1,
              limit: 10
          }
          if (data.items.length) {
              for (let i in data.items) {
                  let item = data.items[i];
                  $($scope).find('table > tbody').html('').append(await item_view(item))
              }
          } else {
              $($scope).find('table > tbody').html(`<td colspan='11'><div class=\"loader\">${mc.i18n('table.empty')}</div></td>`)
          }
      });


      return async function ($scope, $params) {


          mc.events.push('dashboard.agency.stats.list', $scope)
      }
  });