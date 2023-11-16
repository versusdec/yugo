define(
    ["microcore", "mst!/news/list/index"],
    function (mc, view
) {
    return async function (params) {
        document.title = "Новости | Yugo Platform";
        let user = await mc.api.call('users.me');

        return view({admin: user.settings.role === 'admin'});
    }
});