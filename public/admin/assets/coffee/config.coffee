define ["jquery"], ($) ->
    API:
        me: root_path + "user/CurrentData"
        Upload: root_path + "motel/upload"
        Room: root_path + "room"
        User: root_path + "user"
        Motel: root_path + "motel"
        New: root_path + "new"
        Rank: root_path + "rank"
        Order: root_path + "order"
    Order:
        Status: ['等待客人', '進房完成', '取消']