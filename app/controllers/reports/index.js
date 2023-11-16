define(
  ["microcore",
      "mst!/reports/merchant/index", "scripts"
  ],
  function (mc, merchant_view, scripts
  ) {
      let user, filter, hash, tab, type, page;

      mc.events.on('reports.filter.period.change', data => {
          hash.period = data.value;
      })

      mc.events.on('reports.filter.select.change', data => {
          hash[data.name] = data.value
      })

      mc.events.on('reports.filter.apply', async () => {
          if (Object.keys(hash).length)
              mc.router.go(mc.router.hash(hash))
          else
              mc.router.go(location.pathname)
      })

      mc.events.on('reports.filter.reset', async () => {
          mc.router.go(location.pathname)
      })

      return async function (params) {
          document.title = `${mc.i18n('reports.title')} | Yugo Platform`;
          user = await mc.api.call("users.me");

          let data = {
              user: user,
              tab: params.tab || 'daily',
              title: mc.i18n('reports.title')
          };

          tab = params.tab;
          type = params.type;
          hash = mc.router.hash();
          page = parseInt(hash.page) || 1;

          switch (user.role) {
              case 'bookkeeper':
                  return location.href = '/billing/'
              case 'merchant':
                  /*data.region = {
                      value: 'moscow',
                      options: [{
                          option: 'Москва',
                          value: 'moscow'
                      }, {
                          option: 'Область',
                          value: 'region'
                      }]
                  }*/
                  return merchant_view(data);
              case 'webmaster':
                  //return webmaster_view(data);
                  break;
              case 'admin':
                  data.profile = mc.auth.get();
                  //return admin_view(data);
                  break;
          }

      }
  });