
document.querySelectorAll('.deleteListButton').forEach(function (button) {
    button.addEventListener('click', function (event) {

        var deleteButton = this;
        var listName = deleteButton.value;

        $('#confirmationDialog').modal('show');

        document.getElementById('confirmButton').addEventListener('click', function () {

            var hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'deleteLists';
            hiddenInput.value = listName;
            deleteButton.closest('form').appendChild(hiddenInput);

            deleteButton.closest('form').submit();
        });
    });
});


function emptyItemListFunction() {
    $('#alertDialog').modal('show');
}


function sameItemFunction() {
    $('#alertDialog1').modal('show');
}


function sameListFunction() {
    $('#alertDialog2').modal('show');
}

