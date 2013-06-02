$(document).ready(function(){
    var projectTrees = 0;
    $('#submitProjBtn').click(function(event){
        var projectName = $('#inputName').val();
        var projectDesc = $('#inputDesc').val();

        var postBody = 'user_id=' + window.userID;
        var layerData = $('#leftPane .esriViewPopup .attrValue');
        postBody += '&name=' + projectName;
        postBody += '&description=' + projectDesc;
        postBody += '&number_of_trees=' + projectTrees;
        postBody += '&field_id=' + layerData[0].innerHTML;
        postBody += '&park_name=' + layerData[1].innerHTML;
        postBody += '&address=' + layerData[2].innerHTML;

        $.post('/project.json', postBody, function(data){
        });
    });
    $('#addTreeBtn').click(function(event){
        projectTrees++;
        $('#numTrees').html(projectTrees);
    });
    $('#minusTreeBtn').click(function(event){
        projectTrees--;
        projectTrees = projectTrees < 0 ? 0 : projectTrees;
        $('#numTrees').html(projectTrees);
    });
    var updateProgress = function(fid){
        $.get('/project/' + fid + '.json', function(project){
            if (!project){
                $('#createProjBtn').show();
                return;
            }   

            $('#project-info').show();
            $('#projectBar').show();

            var percentage = Math.floor((project['amount_funded']/project.price)*100);
            $('#projectBar .bar').css('width', percentage + '%');
            $('#project-info .name').html(project.name);
            $('#project-info .username').html(project.username);
            console.log(percentage);
            if (percentage < 100){
                $('#projectBar .progress').addClass('active');
                $('#projectBar .progress').removeClass('progress-success');
                $('#projectBar .progress').addClass('progress-warning');
            } else{
                $('#projectBar .progress').removeClass('active');
                $('#projectBar .progress').addClass('progress-success');
                $('#projectBar .progress').removeClass('progress-warning');
            }
        }); 
    }
    $('#donateBtn').click(function(){
        var fieldID = $('#leftPane .esriViewPopup .attrValue')[0].innerHTML;
        var body = 'user_id=' + window.userID;
        body += '&field_id=' + fieldID;
        body += '&amount=' + 1;
        $.post('/transaction.json', body, function(response){
            updateProgress(fieldID);
            $('#yay-plus').get(0).play();
        });
    });
    $('#donateBtn2').click(function(){
        var fieldID = $('#leftPane .esriViewPopup .attrValue')[0].innerHTML;
        var body = 'user_id=' + window.userID;
        body += '&field_id=' + fieldID;
        body += '&amount=' + 1000;
        $.post('/transaction.json', body, function(response){
            updateProgress(fieldID);
            $('#yay').get(0).play();
        });
    });
    $('#notification').click(function(){
        $(this).fadeOut();
    });
});
