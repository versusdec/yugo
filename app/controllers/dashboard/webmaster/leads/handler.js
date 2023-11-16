define(['microcore', 'mst!dashboard/webmaster/leads/item', 'chart'], function (mc, item_view, Chart) {

  let filter = {}, chart;

  function drawChart(items, $scope){
    try{
        let labels = [], data = [];
        if (items && items.length){
          for (const item of items) {
            labels.push(item.category.name);
            data.push(item.amount);
          }
        }

        if (typeof chart !== "undefined") {
          chart.destroy();
        }

        if (data.length > 0){
          document.querySelector('.no-data-placeholder').classList.add('hide');
          chart = new Chart(document.getElementById('chart'), {
            data: {
              labels: labels,
              datasets: [
                {
                  type: 'bar',
                  label: 'Лиды',
                  data: data,
                  borderColor: 'rgba(255,187,0,0.6)',
                  backgroundColor: 'rgba(255,187,0,0.6)',
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
        } else {
          document.querySelector('.no-data-placeholder').classList.remove('hide');
        }
    } catch (e) {
        console.log(e.message);
    }
  }

  mc.events.on('dashboard:webmaster.leads.filter.range.start', async (selected) => {
    filter.start = selected.value
  });

  mc.events.on('dashboard:webmaster.leads.filter.range.finish', async (selected) => {
    filter.finish = selected.value
  });

  mc.events.on('dashboard:webmaster.leads.filter', async ($scope) => {
    let hash_params = mc.router.hash();
    let page = parseInt(hash_params.page) || 1;
    let limit = parseInt(hash_params.limit) || 10;
    let user = await mc.api.call('users.me');

    mc.api.call("stats.leads.webmaster", {
      start: filter.start,
      finish: filter.finish,
      limit: limit,
      offset: (page - 1) * limit
    }).then(async function (leads) {
      $($scope).find('tbody').html('');
      if (leads && leads.items && leads.items.length) {
        for (let i in leads.items) {
          let item = leads.items[i];
          item.filter = filter;
          $($scope).find('tbody').append(await item_view(item))
        }
      } else {
        $($scope).find('.loader').text("нет лидов")
      }

      //drawChart(leads.items, $scope);

      mc.events.push('system:pagination.update', {
        total: leads.total,
        limit: leads.limit,
        current: page
      })
    })
  });

  return async function ($scope, $params) {
    let t = new Date(), m = t.getMonth()+1, d = t.getDate();
    filter = {};
    filter.start = t.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
    await mc.events.push('dashboard:webmaster.leads.filter', $scope)
  }
});