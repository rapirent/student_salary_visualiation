        /*
#4f87cd
#35919e
#4d45b9
#46b871
#b8467e
#ee86ba
#6e6094
#bced51
#dea577
#dd753d
#ea5a5a
#c59562
#b38451
#9d51b3
#509b4e
#b351ab
*/
        // discipline_option=new Array();
        // discipline_option[1]=["教育學門"];
        // discipline_option[2]=["藝術學門", "人文學門", "設計學門"];
        // discipline_option[3]=["社會及行為科學學門", "傳播學門", "商業及管理學門", "法律學門"];
        // discipline_option[4]=["生命科學學門", "自然科學學門", "數學及統計學門", ,"電算機學門"];
        // discipline_option[5]=["工程學門", "建築及都市規劃學門"];
        // discipline_option[6]=["農業科學學門", "獸醫學門"];
        // discipline_option[7]=["醫藥衛生學門", "社會服務學門"];
        // discipline_option[8]=["民生學門", "運輸服務學門", "環境保護學門", "軍營國防安全學門"];
        // discipline_option[9]=["其他學門"];


var margin = {top: 10, right: 0, bottom: 140, left: 0};
var width = 800 , height = 450, padding = 30, barMargin = 5, axisPadding = 80;


jQuery(document).ready(function()
{
    Page_Init();
});

var subjectNumber,fieldNumber;

function Page_Init()
{
    $.getJSON("data/field.json", function (data){
        $('#field').empty().append($('<option></option>').val('').text("請選擇領域"));
        $.each(data, function (i, item){
            $('#field').append(
                $('<option></option>').val(item.fieldId)
                                    .text(item.fieldName)
            );
        });
    });

    $('#discipline').empty().append($('<option></option>').val('').text("-"));
    $('#subject').empty().append($('<option></option>').val('').text("-"));

        //if there is a change, change it!
    $('#field').change(function(){
        fieldChange();
        fieldNumber = $.trim($('#field option:selected').val());
    });

    $('#discipline').change(function(){
        subjectNumber = $.trim($('#discipline option:selected').val());
            // disciplineChange();
    });
    d3.csv("data/data.csv", function(error, data){
        if (error){
            console.log(error);
        }
        console.log("data/data_" + subjectNumber +  ".csv");
        if(data){
            $("#tip").text("以下的資訊以新台幣(NTD)為單位");
        }
        //let it do not look so big
        if(data.length === 1 ){
            width = 1000/4;
        }

        var yMax = d3.max(data, function(d){return parseInt(d.university_salary);});
        var yMin = d3.min(data, function(d){
            if(d.university_salary != 0){
                return parseInt(d.university_salary);
            }
        });
        var xScale = d3.scale.linear()
                        .domain([0, data.length])
                        .range([padding + axisPadding, width + axisPadding - margin.left - margin.right - padding]);
        //to handle the problem that having only one data
        var yScale = data.length == 1 ?
                        d3.scale.linear()
                            .domain([0, yMax])
                            .range([padding, height - margin.top - margin.bottom - padding]):
                        d3.scale.linear()
                            .domain([yMin, yMax])
                            .range([padding, height - margin.top - margin.bottom - padding]);
        var yScale2 =   d3.scale.linear()
                            .domain([yMin, yMax])
                            .range([height - margin.top - margin.bottom - padding, padding]);

//        var barWidth = (width - padding * 2) / data.length - barMargin;

        var svg = d3.select(".chart").append("svg")
                                    .attr("width", width + axisPadding)
                                    .attr("height", height);
        //yAxis

        var yAxis = d3.svg.axis()
                            .scale(yScale2)
                            .tickSize(1)
                            .orient('left');
        svg.append("g")
            .attr({
                "class": "yAxis",
                "transform": "translate(" + axisPadding +",0)"
            })
            .call(yAxis)
            .append("text")
            .attr({
                "text-anchor": "start",
            });
        //bar chart
        var bar = svg.selectAll(".point")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr('class', 'point');
        var color = d3.scale.category20b();
            bar.attr({
                "fill": function(d, i){
                    if(d.university_salary === 0){
                        return "#202020";
                    }
                    return color(parseInt(d.code / 100));
                },
                "cx": function(d, i){
                    return xScale(i);
                },
                "cy": height - margin.top - margin.bottom,
//                    "width": barWidth,
//                    "height": 0,
                "r": function(d) {
                    if(d.university_salary == 0 ){
                        return 0;
                    }else{
                        return Math.sqrt(yScale(d.university_salary));
                    }
                },
                "opacity": 0.5,
                "id": function(d){
                    return "id" + parseInt(d.code / 100);
                },
                })
            .on("click", function(){
                var setNumber = d3.select(this).property("id");
                var setOpa = d3.select(this).attr("opacity");
//                     console.log(setNumber);
//                     console.log(setOpa);
                if(d3.select(this).attr("opacity") == 0.5){
                    d3.selectAll("#" + setNumber).attr({
                        "opacity": "0.9",
                    });
                }else if(d3.select(this).attr("opacity") == 0.9){
                    d3.selectAll("#" + setNumber).attr({
                        "opacity": "0.5",
                        "border": "none",
//                        "border-radius": "99em",
                    });
                }
            })
            .transition()
            .duration(1000)
            .attr({
                "cy": function(d){
                    if(d.university_salary != 0){
                        return height - margin.top - margin.bottom - yScale(d.university_salary);
                    }
                },
//                    "height": function(d){
//                        if(d.university_salary == 0){
//                            return 0;
//                        }
//                        return yScale(d.university_salary);
//                    }
            });
    });
}

function fieldChange(){

    $('#discipline').empty().append($('<option></option>').val('').text("請選擇學門"));
    $('#subject').empty().append($('<option></option>').val('').text("-"));

    var fieldNumber = $.trim($('#field option:selected').val());
    if(fieldNumber.length != 0){
        $.getJSON('data/discipline_0'+ fieldNumber +'.json', function(data){
            $.each(data, function(i, item){
                $('#discipline').append(
                    $('<option></option>').val(item.disciplineId).text(item.disciplineName)
                );
            });
        });
    }
}

    // function disciplineChange(){

    //     $('#subject').empty().append($('<option></option>').val('').text("請選擇學類"));

    //     var fieldNumber = $.trim($('#field option:selected').val());
    //     var disciplineNumber = $.trim($('#discipline option:selected').val());

    //     console.log('data/subject_0'+ fieldNumber + disciplineNumber + '.json')
    //     if(fieldNumber.length != 0  && disciplineNumber.length!=0){
    //         $.getJSON('data/subject_0'+ fieldNumber + disciplineNumber + '.json', function(data){
    //             $.each(data, function(i, item){
    //                 $('#subject').append(
    //                             $('<option></option>').val(item.subjectId)
    //                                                 .text(item.subjectName)
    //                                     );
    //             });
    //         });
    //     }
    // };
//used to filter JSON and choose what to display
//it will return values whose id is selected key in json
function filterJSON(json, key, value) {
    var result = [];
    for (var foo in json) {
        if (json[foo][key] === value) {
            result.push(json[foo]);
        }
    }
    return result;
}
//
function updataDisciplineName(data){
    var temp=[];
    for(var foo in data){
        temp.push(data[foo].discipline);
    }
    return temp;
}
window.onload = function(){
    //create json along with json
    document.getElementById("search").onclick = function() {
        d3.selectAll("#selectSubject").remove();
    // d3.selectAll(".xAxis").remove();
    // var selectDepartment;
    // d3.csv("data/data_" + subjectNumber + ".csv" , function(error, json){
    // if (error)
    // {
//        console.log(fieldNumber);
//         console.log(subjectNumber);
//         console.log(error);
    // }
        // $.each(json, function () {
        //     $("#checkboxes").attr({
        //                         "width": width
        //                     })
        //                     .append($("<div>").text(this.Name)
        //                     .attr('style', "color:" + this.Color)
        //                     .attr('id', "selectSubject")
        //                     .prepend(
        //                         $("<input>").attr('type', 'checkbox')
        //                                 .val(this.Id)
        //                                 .prop('checked', this.checked)
        //                     )//add tip color!
        //                     .append($("<span>")
        //                     .text("█")
        //                     .attr({
        //                         "background-color": this.Color,
        //                         // "fill": this.Color
        //                     })));
        //     selectDepartment = filterJSON(json, "checked", true);
        // });


        // $("#checkboxes").on('change', '[type=checkbox]', function () {
        //     if(!this.checked){
        //         for (var foo in json) {
        //             if (json[foo]["Id"] === this.value) {
        //                 json[foo]["checked"] = false;
        //             }
        //         }
        //     }
        //     else{
        //         for (var foo in json) {
        //             if (json[foo]["Id"] === this.value) {
        //                 json[foo]["checked"] = true;
        //             }
        //         }
        //     }
        //     selectDepartment = filterJSON(json, "checked", true);
            // console.log(json);
        //     console.log("12354");
        //     console.log(selectDepartment);
        // });
    // d3 to visualize
        d3.select("svg").remove();
        // console.log(subjectNumber);
    //    console.log("data/data_" + subjectNumber +  ".csv");
        d3.csv("data/data_" + subjectNumber +  ".csv", function(error, data){
            if (error){
            console.log(error);
        }
            console.log("data/data_" + subjectNumber +  ".csv");
            if(data){
                $("#tip").text("以下的資訊以新台幣(NTD)為單位");
            }
            //let it do not look so big
            if(data.length === 1 ){
                width = 1000/4;
            }

            var yMax = d3.max(data, function(d){return parseInt(d.university_salary);});
            var yMin = d3.min(data, function(d){
                if(d.university_salary != 0){
                    return parseInt(d.university_salary);
                }
            });
            var xScale = d3.scale.linear()
                            .domain([0, data.length])
                            .range([padding, width - margin.left - margin.right - padding]);
            //to handle the problem that having only one data
            var yScale = data.length == 1 ?
                            d3.scale.linear()
                                .domain([0, yMax])
                                .range([padding, height - margin.top - margin.bottom - padding]):
                            d3.scale.linear()
                                .domain([yMin, yMax])
                                .range([padding, height - margin.top - margin.bottom - padding]);

            var barWidth = (width - padding * 2) / data.length - barMargin;


//            data = data.sort(function(a, b) {
//                return d3.descending(parseFloat(a.university_salary), parseFloat(b.university_salary));
//            });


            var svg = d3.select(".chart").append("svg")
                                        .attr("width", width)
                                        .attr("height", height);
        //bar chart
            var bar = svg.selectAll("rect")
                        .data(data)
                        .enter()
                        .append("circle");
            var color = d3.scale.category20b();
                bar.attr({
                    "fill": function(d, i){
                        if(d.university_salary === 0){
                            return "#202020";
                        }
                        return color(parseInt(d.code / 100));
                    },
                    "cx": function(d, i){
                        return xScale(i);
                    },
                    "cy": height - margin.top - margin.bottom,
//                    "width": barWidth,
//                    "height": 0,
                    "r": function(d) {
                        if(d.university_salary == 0 ){
                            return 0;
                        }else{
                            return Math.sqrt(yScale(d.university_salary));
                        }
                    },
                    "opacity": 0.5,
                    "id": function(d){
                        return "id" + parseInt(d.code / 100);
                    }
                    })
                .on("click", function(){
                    var setNumber = d3.select(this).property("id");
                    var setOpa = d3.select(this).attr("opacity");
//                     console.log(setNumber);
//                     console.log(setOpa);
                    if(d3.select(this).attr("opacity") == 0.5){
                        d3.selectAll("#" + setNumber).attr("opacity", 1);
                    }else if(d3.select(this).attr("opacity") == 1){
                        d3.selectAll("#" + setNumber).attr("opacity", 0.5);
                    }
                })
                .transition()
                .duration(1000)
                .attr({
                    "cy": function(d){
                        if(d.university_salary != 0){
                            return height - margin.top - margin.bottom - yScale(d.university_salary);
                        }
                    },
//                    "height": function(d){
//                        if(d.university_salary == 0){
//                            return 0;
//                        }
//                        return yScale(d.university_salary);
//                    }
                });

            var barTooltip = bar.append("title")
                            .text(function(d) {
                                return d.discipline;
                            });


                //TEXT and test

//            svg.selectAll("text")
//                .data(data)
//                .enter()
//                .append("text")
//                .text(function(d){
//                    if(d.university_salary == 0){
//                        return "NoData";
//                    }
//                    return d.university_salary;
//                })
//                .attr({
//                    "x": function(d,i){
//                        return xScale(i);
//                    },
//                    "y": height - margin.top - margin.bottom,
//                    "fill": "black",
//                    "text-anchor": "center",
//                    "font-size": "16px",
////                    "visibility": "hide",
//                })
//                .transition()
//                .duration(1000)
//                .attr({
//                    "y": function(d){
//                        if(d.university_salary != 0 ){
//                            return height - margin.top - margin.bottom - yScale(d.university_salary)  - 5;
//                        }else{
//                            return height - margin.top - margin.bottom;
//                        }
//                    }
//                });
//            //x axis
//            var disciplineName = updataDisciplineName(data);
//            var xAxisTick = d3.svg.axis()
//                        .scale(xScale)
//                        .tickFormat(function(d,i) { return disciplineName[i]; })
//                        .tickSize(0)
//                        .ticks(data.length)
//                        .orient("bottom");
//
//            svg.append("g")
//                .attr({
//                    "class": "xAxis",
//                    "transform": "translate(" + (barWidth/2) + "," + (height - margin.top - margin.bottom) + ")"
//                })
//                .call(xAxisTick)
//                .selectAll("text")
//                .style({
//                    "font-size": "14px",
//                    "text-anchor": "start",
//                    "letter-spacing": "1px",
////                    "transform": "rotate(20deg)",
//                    "color": "#666666"
//                })
//                .attr({
//                    "writing-mode": "vertical-lr",
//                    "transform": "rotate(30)"
//                });
        // function updataData(data,indicator){
        //     var result=[];
        //     for (var foo in data){
        //         data[foo]["selected"] = 0;
        //     }
        //     for (var foo in data) {
        //         for(var barr in indicator){
        //             if(data[foo]["department_number"] === indicator[barr]["Id"]){
        //                 result.push(data[foo]);
        //                 data[foo]["selected"] = 1;
        //             }
        //         }
        //     }

        //     return result;
        // }

        // function updataBarChart(newData,data){
        //     //bar chart
        //     var count = 0;
        //     bar.transition()
        //         .duration(1000)
        //         .attr({
        //             "x": function(d, i){
        //                 if(d.selected == 1){
        //                     return xScale(count++);
        //                 }
        //                 return xScale(data.length);
        //             },
        //             "y": function(d){
        //                 return height - margin.top - margin.bottom - yScale(d.enroll_rate);
        //             },
        //             "width": barWidth,
        //             "height": function(d){
        //                 return yScale(d.enroll_rate);
        //             },
        //             "opacity": function(d){
        //                 if(d.selected == 1){
        //                     if(d3.select(this).attr("opacity") == 0.5){
        //                         return 0.5;
        //                     }else{
        //                         return 1;
        //                     }
        //                 }
        //                 return 0;
        //             }
        //         })

        //     bar.append("title")
        //         .text(function(d) {
        //             if(d.selected == 1){
        //                 if(d.national != "公立"){
        //                     return d.national + d.name + " " + d.department_name;
        //                 }
        //                 return d.name + " " + d.department_name;
        //             }
        //         });
        //         //TEXT and test

        //     svg.selectAll("text")
        //         .data(newData)
        //         .enter()
        //         .append("text")
        //         .text(function(d, i){
        //             return d.enroll_rate + "%";
        //         })
        //         .transition()
        //         .duration(1000)
        //         .attr({
        //             "x": function(d,i){
        //                 return xScale(i);
        //             },
        //             "y": function(d){
        //                 return height - margin.top - margin.bottom - yScale(d.enroll_rate) - 5;
        //             },
        //             "fill": "black",
        //             "text-anchor": "center",
        //             // "text-align": "center",
        //             "font-weight": "bold",
        //             "font-size": "12px",
        //         });
        //     //x axis
        //         schoolName = updataSchoolName(newData);
        // console.log(schoolName);
        // console.log(newData);
        // count = 0;
        // // xScalePrint = d3.scale.linear()
        // //                         .domain([0, newData.length])
        // //                         .range([0,width - margin.left - margin.right]);
        //     // var xScale = d3.scale.linear()
        //     //                 .domain([0, data.length])
        //     //                 .range([padding, width - margin.left - margin.right - padding]);
        //     console.log(schoolName.length);
        //     xAxisTickNew = d3.svg.axis()
        //                     .scale(xScale)
        //                     .tickFormat(function(d,i) {
        //                         if(i <= schoolName.length){
        //                             return schoolName[i];
        //                         }else{
        //                             return "";
        //                         }
        //                     })
        //                     .tickSize(0)
        //                     .ticks(data.length)
        //                     .orient("bottom");
        //     console.log(xAxisTickNew)
        //       svg.append("g")
        //             .attr({
        //                 "class": "xaxis",
        //                 "transform": "translate(" + (barWidth/2) + "," + (height - margin.top - margin.bottom) + ")"
        //             })
        //             .call(xAxisTickNew)
        //             .selectAll("text")
        //             .style({
        //                 "font-size": "13px",
        //                 "text-anchor": "start",
        //                 "letter-spacing": "0px",
        //                 "font-weight": "bold",
        //             })
        //             .attr("writing-mode", "vertical-lr");
        // }
        });
    };
};