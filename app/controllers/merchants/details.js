define(
  ["microcore",
      "mst!/merchants/details/index", "scripts"
  ],
  function (mc, merchant_view, scripts
  ) {
      let user, filter, hash, type, page;

      mc.events.on('merchants.details.period.change', data => {
          if (data.value === '') {
              delete filter.timestamp;
              delete hash.period;
          } else {
              filter.timestamp = data.period;
              hash.period = data.value;
          }
      })

      mc.events.on('merchants.details.filter.apply', async () => {
          if (Object.keys(hash).length)
              mc.router.go(mc.router.hash(hash))
          else
              mc.router.go(location.pathname)
      })

      mc.events.on('merchants.details.filter.reset', async () => {
          mc.router.go(location.pathname)
      })

      return async function (params) {
          document.title = `${mc.i18n('merchants.title')} | Yugo Platform`;
          let me = await mc.api.call("users.me");
          user = await mc.api.call("agencies.users.get", {id: +params.id});
          user = {
              name: 'Человек',
              surname: 'Человеческий',
              email: 'etomoyemail@mail.sry'
          }
          hash = mc.router.hash();
          page = parseInt(hash.page) || 1;
          filter = {
              ...filter,
              ...hash
          }
          let data = {
              role: me.role,
              period: hash.period,
              user: user
          };
          if (hash.period) {
              data.period = hash.period;
              filter.timestamp = scripts.setTimestamp(hash.period);
              delete filter.period;
          }

          return merchant_view(data);

      }
  });