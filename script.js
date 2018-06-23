$(document).ready(function () {
    initializeTable();
    getGames(0);
});

function getGames(ajid) {
    var top25 = ['Mario & Luigi: Superstar Saga','Conker\'s Bad Fur Day','Super Mario World: Super Mario Advance 2','Paper Mario: The Thousand-Year Door','The Legend Of Zelda: Breath Of The Wild','Banjo-Tooie','Super Mario Odyssey','Portal 2','Super Mario 64','RollerCoaster Tycoon 2','Ape Escape 3','Burnout 3: Takedown','New Super Mario Bros. Wii','Saints Row: The Third','Ape Escape 2','Mario Kart DS','Super Mario 3D Land','Portal','Fantasy Life','WarioWare, Inc.: Mega Microgames!','Super Smash Bros. Brawl','Undertale','Xenoblade Chronicles','Antichamber','Cave Story+'];
    var proxy = 'https://cors.now.sh/';
    $.get(proxy + 'http://backloggery.com/ajax_moregames.php?user=' + $('#username').text() + '&alpha=1&ajid=' + ajid, function(data) {
        var html = $.parseHTML(data);
        var next = true;
        $.each(html, function(i, gamebox) {
            if ($(gamebox).hasClass('systemend')) {
                initializeFilters();
                next = false;
                return;
            } else if (i % 2 != 0) {
                var title = $($('b', gamebox)[0]).text();
                var system = $($('b', gamebox)[1]).text().trim();

                var system = system === 'WiiU' ? 'Wii U' : system;

                var score = $($('.lift', gamebox)[1]).attr('src');
                score = score ? score[7] : 0;
                var stars = ['N/A', 'Poor', 'Poor', 'Okay', 'Good', 'Excellent'];
                var colors = ['dark', 'danger', 'danger', 'warning', 'success', 'primary'];

                var comment = $($('[id^=comments]', gamebox)[0]).text();
                comment = comment ? comment : '<span class="text-muted">(no review available)</span>';

                if (score) {
                    var award = top25.includes(title) ? '<span class="text-warning"><i class="fas fa-award"></i></span>' : '';
                    var gameContent = "<b>" + title + "</b> <small><span class=\"badge badge-secondary\">" + system + "</span> " + award + "<br />" + comment + "</small>";
                    var scoreContent = "<span class=\"badge badge-pill badge-" + colors[score] + "\"><p hidden>" + score + "</p>" + stars[score] + "</span>";
                    var row = $('#game-table').dataTable().fnAddData([gameContent, scoreContent, title, system]);
                }
            }
        });
        if (ajid === 0) {
            $('#game-table').css('display', 'table');
        }
        if (next) {
            getGames(ajid + 50);
        }
    });
}

function initializeTable() {
    $('#game-table').DataTable( {
        "bAutoWidth": false,
        "bDeferRender": true,
        "pagingType": "simple",
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": true,
                "searchable": false,
                "width": "90%"
            },
            {
                "targets": [ 1 ],
                "visible": true,
                "searchable": true,
                "width": "10%"
            },
            {
                "targets": [ 2, 3 ],
                "visible": false,
                "searchable": true
            }
        ]
    });
    $('#game-table_length').removeClass('dataTables_length');
    $('#game-table_length').html("<i class=\"fas fa-gamepad fa-2x fa-spin\"></i>");
}

function initializeFilters() {
    var systems = "<select class=\"custom-select\" id=\"filter-systems\" onchange=\"filterBySystem()\"><option selected>all systems</option><option>" + $('#game-table').dataTable().api().column(3).data().unique().sort().join('</option><option>') + "<\select>";
    var scores = "<select class=\"custom-select\" id=\"filter-scores\" onchange=\"filterByScore()\"><option selected>all scores</option><option>Excellent</option><option>Good</option><option>Okay</option><option>Poor</option></select>";
    $('#game-table_length').hide().html("<form class=\"form-inline\">Filter by &nbsp" + systems + "&nbsp and by &nbsp" + scores + "&nbsp&nbsp <button type=\"button\" class=\"btn btn-sm btn-outline-dark\" onclick=\"clearFilter()\"><i class=\"fas fa-sync\"></i> Reset</button></form>").fadeIn();
}

function filterBySystem() {
    var s = $('#filter-systems').find(":selected").text();
    if (s === "all systems") {
        $('#game-table').dataTable().fnFilter("", 3, true);
    } else {
        $('#game-table').dataTable().fnFilter("^" + s + "$", 3, true);
    }
}

function filterByScore() {
    var s = $('#filter-scores').find(":selected").text();
    if (s === "all scores") {
        $('#game-table').dataTable().fnFilter("", 1);
    } else {
        $('#game-table').dataTable().fnFilter(s, 1);
        console.log(s[0]);
    }
}

function clearFilter() {
    $('#filter-systems')[0].selectedIndex = 0;
    $('#filter-scores')[0].selectedIndex = 0;
    $('#game-table').dataTable().fnFilter("", 3);
    $('#game-table').dataTable().fnFilter("", 1);
}