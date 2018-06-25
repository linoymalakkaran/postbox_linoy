Object.defineProperty(String.prototype, "getDateFormatForDM", {
    value: function getDateFormatForDM() {
        let date = this;
        let formattedDate = '';
        if (date && typeof date === 'string') {
            let splitedDate = date.split('-'),
                dd = splitedDate[0],
                mm = splitedDate[1],
                yyyy = splitedDate[2],
                day = new Date(yyyy, mm, dd);
            formattedDate = moment(day).format('YYYY-MM-DD HH:mm:ss');
        } else if (date instanceof Date) {
            formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
        }
        if (formattedDate === 'Invalid date') {
            formattedDate = date;
        }

        return formattedDate;
    },
    configurable: true
});


Object.defineProperty(String.prototype, "getDateFormatForVM", {
    value: function getDateFormatForVM(dateFormat) {
        let formattedDate = '',
            date = this;
        if (date && dateFormat === 'DD-MM-YYYY') {
            let splitedDate = date.split('/'),
                dd = splitedDate[0],
                mm = splitedDate[1],
                yyyy = splitedDate[2],
                day = new Date(yyyy, mm, dd);
            formattedDate = moment(day).format('DD-MM-YYYY');
        } else if (date) {
            formattedDate = moment(date).format('DD-MM-YYYY');
        }
        if (formattedDate === 'Invalid date') {
            formattedDate = date;
        }
        return formattedDate;
    },
    configurable: true
});

Object.defineProperty(String.prototype, "getFormattedDate", {
    value: function getFormattedDate(today) {
        let dd = today.getDate(),
            mm = today.getMonth() + 1;
        yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }

        return dd.toString() + mm.toString() + yyyy.toString();
    },
    configurable: true
});