define(
  ["microcore", "mst!/profile/index", 'app/modules/notify', 'app/modules/confirm'],
  function (mc, view, notify, confirm
  ) {
    let item = {};

    function field_error(field, tab) {
      $('ul.tabs li a')[tab].click();
      $(field).addClass('error');
      setTimeout(() => {
        $(field).removeClass('error')
      }, 3000);
      return false
    }

    mc.events.on('sys:page.init:profile/index', () => {
      $('#profile .avatar img').attr('src', item.avatar ?
        'https://partners.yugo.ru' + item.avatar : '/img/ava.png');
      $('button[data-type]').on('click', async (e) => {

        item.email = $('input[name=email]').val();
        item.name = $('input[name=name]').val();
        item.surname = $('input[name=surname]').val();
        item.second_name = $('input[name=second_name]').val();
        item.phone = $('input[name=phone]').val().replace(/[^0-9]/, '');
        item.telegram = $('input[name=telegram]').val();

        if (item.phone.length < 1) {
          item.phone = undefined
        }

        if (!item.email.match(/\S+@\S+\.\S+/)) {
          return field_error('input[name=email]', 0);
        }

        if (item.settings && item.settings.manager && item.settings.manager.id){
          item.settings.manager = item.settings.manager.id;
        }

        if (!item.notifications){
          item.notifications = {};
        }

        item.notifications.new_leads = Number($('input[name=notifications_new_leads]')[0].checked);
        item.notifications.appeals = Number($('input[name=notifications_appeals]')[0].checked);
        item.notifications.autoapprove = Number($('input[name=notifications_autoapprove]')[0].checked);
        item.notifications.review = Number($('input[name=notifications_review]')[0].checked);

        let old_password = $('input[name=old]').val(),
            new_password = $('input[name=new]').val(),
            repeat_password = $('input[name=rep]').val();

        if (new_password !== ""){
          if (new_password.length > 5 && repeat_password.length > 5 && new_password === repeat_password) {
            let auth = await mc.api.call("auth.login", {
              email: item.email,
              password: old_password
            });
            if (auth && auth.id && auth.id === item.id) {
              item.password = new_password;
              item.old_password = old_password;
            } else {
              notify('Некорректный пароль');
              return field_error('input[name=old]', 1)
            }
          } else {
            notify('Пароли не совпадают либо длина меньше 6 символов');
            return field_error('input[name=rep]', 1)
          }
        }

        mc.api.call('users.update', item).then((res) => {
          if (res) {
            notify('Профиль обновлен');
            mc.router.go('/profile/')
            $('img.avatar').attr('src', (item.avatar&&item.avatar.length?item.avatar:'/img/ava.png'));
          } else {
            notify('Профиль не содержит изменений');
          }
        })
      })
    });

    mc.events.on('avatar.select', async () => {
      $('#fileinput')[0].click()
    });

    mc.events.on('avatar.update', async (input) => {
      let data = new FormData();
      data.append('file', input.files[0]);

      let response = await fetch('https://partners.yugo.ru/upload', {
        method: 'POST',
        body: data
      }).then(res => res.json());

      item.avatar = response[0].path;
      $('.avatar img').attr('src', `${response[0].path}`)

    });

    mc.events.on('avatar.remove', async () => {
      item.avatar = "";
      $('.avatar img').attr('src', `/img/ava.png`);
    });

    mc.events.on("profile.integration.token.generate", async (button) => {
      mc.api.call("auth.generate", {}).then((res) => {
        let token_container = document.querySelector("#integration_token");
        token_container.innerHTML = res;
        token_container.style.display = "block";
      });
    });
    mc.events.on("profile.integration.token.copy", async (button) => {
      let range = document.createRange();
      range.selectNode(document.querySelector("#integration_token"));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
      notify('Токен скопирован в буфер обмена');
    });

    return async function (params) {
      document.title = "Мой профиль | Yugo Platform";
      let title = 'Мой профиль';
      let data = {type: params.type};
      data.title = title;
      data.user = await mc.api.call('users.me');
      item = data.user;

      data.genders = [
        {option: 'мужской', value: 'male'},
        {option: 'женский', value: 'female'}
      ];
      data.gender_change = (selected) => {
        item.gender = selected.value
      };
      return view(data);
    }
  });