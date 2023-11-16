require.config({
    paths: {
        microcore: "/js/microcore",
        routes: "/routes",
        render: "/js/render",
        common: "/js/common",
        masked: "/js/masked",
        miq: "/js/miq",
        notify: "/app/modules/notify",
        popup: "/app/modules/popup",
        confirm: "/app/modules/confirm",
        "app/modules/sortable": "/app/modules/sortable",
        "app/modules/suggests": "/app/modules/suggests",
        "app/filters/time": "/app/filters/time",
        dropzone: "/js/dropzone",
        chart: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.0.2/chart.min",
        apexcharts: "/js/apexcharts",
        scripts: "/js/scripts",
        recorder: "/app/modules/recorder",
    },
    render: {
        path: "/app/views",
        helpers: "/app/modules",
        filters: "/app/filters"
    },
    urlArgs: "?v=1.8",
    domain: "5.188.81.216",
    api: "https://5.188.81.216/api/",
    partners: "http://5.188.81.216"
});

if (!localStorage.getItem('lang')) {
    switch (navigator.language.slice(0, 2)) {
        case 'uk':
        case 'ru':
        case 'be':
            localStorage.setItem('lang', 'ru');
            break;
        default:
            localStorage.setItem('lang', 'en');
            break;
    }
}

define(["microcore", "json!routes", "common"],
  function (mc, routes) {
      fetch(`/locale/${localStorage.getItem('lang')}.json`)
        .then(response => response.json()).then((locale) => {
          mc.storage.set('locale', JSON.stringify(locale))
      });

      if ([location.host].includes(require.config.comm_sub_domain) || [location.host].includes(require.config.leads_sub_domain)) {
          let project_id = parseInt(location.pathname.split('/')[1])
          mc.storage.set('project_id', project_id)
      }
      mc.storage.set('config.api', require.config.api)
      mc.storage.set('config.domain', require.config.domain)

      let current_layout = '';
      let observer = new MutationObserver(mutationRecords => {
          $('a:not(.external)').forEach((el) => {
              let href = el.getAttribute('href');
              let target = el.hasAttribute('target');
              let download = el.hasAttribute('download');
              if (href && !(target || download) && href.substr(0, 5) !== '#tab=') {
                  el.onclick = (ev) => {
                      ev.preventDefault();
                      mc.router.go(href);
                  };
                  return false;
              }
          });

          $('*[handler]:not([inited])').forEach(function ($scope) {
              $scope.setAttribute('inited', 'inited');
              require(['/app/' + $scope.getAttribute('handler')], function (handler) {
                  handler($scope, $scope.dataset);
                  mc.events.push("sys:page.init:" + $scope.getAttribute('handler'));
              });
          })
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });

      for (let route in routes) {
          let route_info = routes[route];
          mc.router.add(route, function (params) {
              if (route_info.role.indexOf(mc.auth.get().role) != -1 || route_info.role.indexOf("public") != -1 || mc.auth.get().role === 'admin') {
                  route_info.layout = route_info.layout || 'main';
                  require(['/app/controllers/' + route_info.controller, 'mst!layouts/' + route_info.layout], async function (controller, layout) {
                      let html = await controller(params);
                      if (current_layout !== route_info.layout) {
                          document.body.innerHTML = await layout({content: html, user: mc.auth.get()});
                          current_layout = route_info.layout
                      } else {
                          $('*[data-content-holder]')[0].innerHTML = html;
                      }

                      mc.events.push("sys:page.init:" + route_info.controller);
                      mc.events.push("routeChange");
                  })
              }
          }, route_info.params);
      }

      mc.events.on('logout', function () {
          mc.auth.logout();
          mc.router.go('/login')
      });

      if (mc.auth.get().role === 'public'
        && location.pathname !== '/login'
        && location.pathname !== '/registration'
        && location.pathname !== '/recover'
      ) {
          mc.router.go('/login')
      }
      mc.router.dispatch(location.pathname)
  });
