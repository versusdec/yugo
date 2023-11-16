define(
  ["microcore",
      "mst!/dashboard/merchant/index",
      "mst!/dashboard/webmaster/index",
      "mst!/dashboard/admin/index",
      "mst!/dashboard/agency/index",
      "chart",
      "apexcharts",
      "scripts"
  ],
  function (mc, merchant_view, webmaster_view, admin_view, agency_view, Chart, ApexCharts, scripts
  ) {
      let user;

      /*
      mc.events.on('sys:page.init:dashboard/index', async ($scope) => {
        if ($('#chart').length) {
          const chart = new Chart(document.getElementById('chart'), {
            data: {
              labels: ['адын', 'дыва', 'тыри', 'читыри', 'пйат'],
              datasets: [
                {
                  type: 'bar',
                  label: 'Лиды',
                  data: [10, 50, 4, 100, 56],
                  borderColor: 'rgba(255,187,0,0.6)',
                  backgroundColor: 'rgba(255,187,0,0.6)',
                  tension: 0.5
                },
                {
                  type: 'bar',
                  label: 'Звонки',
                  data: [24, 10, 12, 45, 74],
                  borderColor: 'rgba(198,157,210,0.6)',
                  backgroundColor: 'rgba(198,157,210,0.6)',
                  tension: 0.5
                },
                {
                  type: 'line',
                  label: 'Конверсия',
                  data: [14, 32, 54, 84, 45],
                  borderColor: 'rgba(6,214,160,1)',
                  backgroundColor: 'rgba(6,214,160,1)',
                  tension: 0.5
                }
              ]
            },
            config: {
              options: {
                responsive: true
              }
            }
          });
        }
      });
       */

      return async function (params) {
          document.title = `${mc.i18n('dashboard.title')} | Yugo Platform`;
          user = await mc.api.call("users.me");
          let data = {
              user: user,

          };
          console.log(data);
          if (mc.router.hash().period)
              data.period = mc.router.hash().period;
          else {
              const today = new Date();
              data.period = scripts.getPeriod(today, today)
          }

          const batch = await mc.api.batch({
              method: 'stats.dashboard.merchant.summary',
              params: data.period ? {period: data.period} : {}
          })
          data.summary = batch[0]
          console.log(data);
          switch (user.role) {
              case 'bookkeeper':
                  location.href = '/billing/';
                  break;
              case 'merchant':
                  return merchant_view(data);
              case 'webmaster':
                  return webmaster_view(data);
              case 'agency_manager':
              case 'agency_admin':
                  return agency_view(data);
              case 'admin':
                  data.profile = mc.auth.get();
                  return admin_view(data);
          }
      }
  });