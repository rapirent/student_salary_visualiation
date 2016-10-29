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



var margin = {top: 10, right: 0, bottom: 140, left: 0};
var height = 450, padding = 30, barMargin = 5, axisPadding = 80 , legendPadding = 120;
var width = 800 + axisPadding + legendPadding;


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
    d3.csv("data/data.csv", function(error, data){
        if (error){
            console.log(error);
        }
        console.log("data/data_" + subjectNumber +  ".csv");
//        if(data){
//            $("#tip").text("以下的資訊以新台幣(NTD)為單位");
//        }
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
                        .range([padding + axisPadding, width - legendPadding - margin.left - margin.right - padding]);
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
                                    .attr("width", width)
                                    .attr("height", height);
        //sorted data
//        console.log(data);
//        var sortData = [];
//        for(foo in data){
//            sortData.push(data[foo]);
//        }
//        console.log(sortData);
//        sortData = sortData.sort(function(a, b) {
//            return d3.descending(a.university_salary, b.university_salary);
//        });
//        for(foo in sortData){
//            for(foobar in data){
//                if(sortData[foo]["code"] === data[foobar]["code"]){
//                    console.log("foobar");
//                    console.log(foobar);
//                    console.log(foo);
//                    sortData[foo]["university_salary"] = parseInt(foobar);
//                }
//            }
//        }
//        for(foo in sortData)
//        {
//            sortData[foo] = data[sortData[foo]]
//        }

        //yAxis
        console.log(data);
//        console.log(sortData);
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
                "class": function(d){
                    return d.field + "領域 " + d.subject;
                },
                })
            .on("mouseover", function(){
                var setNumber = d3.select(this).property("id");
                var selectClass = d3.select(this).attr("class");
                d3.selectAll("#" + setNumber).attr({
                    "opacity": 0.9,
                    "stroke": "rgba(0, 0, 0, 0.12)",
                    "stroke-width": 2,
                });
                console.log(selectClass);
                $(".info").empty().text(selectClass);
            })
            .on("mouseout", function(){
                var setNumber = d3.select(this).property("id");
                d3.selectAll("#" + setNumber).attr({
                        "opacity": 0.5,
                        "stroke": "rgba(0, 0, 0, 0.12)",
                        "stroke-width": 0,
                });
            })
            .on("click", function(){
                var setNumber = d3.select(this).property("id");
                console.log(setNumber);
                pageChange(setNumber);
            })
            .transition()
            .duration(1000)
            .attr({
                "cy": function(d){
                    if(d.university_salary != 0){
                        return height - margin.top - margin.bottom - yScale(d.university_salary);
                    }
                },
            });
        //legend
        var legendData = [];
        var legendText = [];
        var legendField= [];
        var foo = 0;
        for(var foobar in data){
            console.log(foobar);
            if(parseInt(data[foobar]["code"] / 100) != foo){
                foo = parseInt(data[foobar]["code"] / 100);
                legendData.push(foo);
                legendText.push(data[foobar]["subject"].slice(0,-2));
                legendField.push(data[foobar]["field"]);
            }
        }
        console.log(legendData);
        var legend = svg.selectAll(".legend")
                        .data(legendData)
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) { return "translate(" + (width - legendPadding) + "," + i * 15 + ")"; });

        legend.append("rect")
                .attr({
//                    "x": "width - 5",
                    "width": 10,
                    "height": 10,
                    "fill": function(d){
                        return color(d);
                    },
                    "id": function(d){
                        return "id" + d;
                    },
                    "opacity": 0.5,
                    "class": function(d, i){
                        return legendField[i] + "領域 " + legendText[i] + "學門";
                    },
                })
            .on("mouseover", function(){
                var setNumber = d3.select(this).property("id");
                var selectClass = d3.select(this).attr("class");
                d3.selectAll("#" + setNumber).attr({
                    "opacity": 0.9,
                    "stroke": "rgba(0, 0, 0, 0.12)",
                    "stroke-width": 2,
                });
                $(".info").empty().text(selectClass);
            })
            .on("mouseout", function(){
                var setNumber = d3.select(this).property("id");
                d3.selectAll("#" + setNumber).attr({
                    "opacity": 0.5,
                    "stroke": "rgba(0, 0, 0, 0.12)",
                    "stroke-width": 0,
                });
            })
            .on("click", function(){
                var setNumber = d3.select(this).property("id");
                console.log(setNumber);
                pageChange(setNumber);
            })
//
//        } else { //deactivate
//          if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
//            d3.select(this)
//              .style("stroke", "none");

//            active_link = "0"; //reset

            //restore remaining boxes to normal opacity
//            for (i = 0; i < legendClassArray.length; i++) {
//                d3.select("#id" + legendClassArray[i])
//                  .style("opacity", 1);
//            }

            //restore plot to original
//            restorePlot(d);
//
//          }
//
//        } //end active_link check
//
//
//      });
        console.log(legendText);
        legend.append("text")
                .attr({
                    "x": "20",
                    "y": "5",
                    "dy": ".35em",
                })
                .style({
                    "text-anchor": "start",
                    "font-size": "0.5em",
                })
                .text(function(d, i) { return legendText[i]; });
        //line
          svg.append("line")
            .attr({
              "x1": axisPadding,
              "y1": yScale2(47300),
              "x2": width - legendPadding - margin.left - margin.right - padding,
              "y2": yScale2(47300),
              "stroke": "#000099",
              "stroke-width": 2,
              "stroke-dasharray": 10,
              "id": "averageLine",
              "opacity": 0,
            })
//            .on("mouseover", function() {
//                console.log("fuck");
//                d3.selectAll("#averageText").attr("opacity", 1)
//            })
//            .on("mouseout", function() {
//                d3.selectAll("#averageText").attr("opacity", 0);
//            })


        svg.append("text")//male line text
            .attr({
                "x": width/2,
                "y": yScale2(47300 + 10000),
                "dy": ".35em",
//                "fill": "#000029",
                "id": "averageText",
                "opacity": 0,
            })
            .text("103年平均薪資：47300(NTD)")
            .style({
                "fill": "#000099",
                "text-anchor": "middle",
                "font-size": 16,
            })
        d3.select("#checkAverage")//maleAverage(checkbox) <--> on click function
            .on("click", function(){
                if(d3.select("#averageLine").attr("opacity")==0&&
                   d3.select("#averageText").attr("opacity")==0){
                    d3.select("#averageLine").attr("opacity", 1);
                    d3.select("#averageText").attr("opacity", 1);
                }else{
                    d3.select("#averageLine").attr("opacity", 0);
                    d3.select("#averageText").attr("opacity", 0);
                }
            })
//        check if sort?
        var sorted = false;
        d3.select("#checkSort")
            .on("click", function(){
                if(sorted == false){
                    console.log("test");
                    data = data.sort(function(a,b){
                        return d3.descending(a.university_salary, b.university_salary);
                    })
                    bar.transition()
                        .duration(1000)
                        .attr({
                        "cx": function(d, i){
                            return xScale(i);
                        }
                    })
                    sorted = true;
                }else{
                    bar.transition()
                        .duration(1000)
                        .attr({
                            "cx": function(d, i){
                                return xScale(i);
                            }
                        })
                    sorted = false;
                }
            })
    });
};
function pageChange(selectNumber) {

    console.log("123");
    selectNumber = selectNumber.slice(2);
    console.log(selectNumber);
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
    d3.selectAll("svg").remove();
    // console.log(subjectNumber);
//    console.log("data/data_" + subjectNumber +  ".csv");
    d3.csv("data/data_" + selectNumber +  ".csv", function(error, datasheet){
        if (error){
        console.log(error);
    }
        console.log("data/data_" + selectNumber +  ".csv");
        console.log(datasheet);
//        if(datasheet){
//            $("#tip").text("以下的資訊以新台幣(NTD)為單位");
//        }
        //let it do not look so big
        if(datasheet.length === 1 ){
            width = 1000/4;
        }

        var yMax = d3.max(datasheet, function(d){return parseInt(d.university_salary);});
        var yMin = d3.min(datasheet, function(d){
            if(d.university_salary != 0){
                return parseInt(d.university_salary);
            }
        });
        if(yMax <= 47300){
            yMax = 47300;
        }else if(yMin>=47300){
            yMin = 47300;
        }
        var xScale = d3.scale.linear()
                        .domain([0, datasheet.length])
                        .range([padding + axisPadding, width - legendPadding - margin.left - margin.right - padding]);
        //to handle the problem that having only one data
        var yScale = d3.scale.linear()
                            .domain([yMin, yMax])
                            .range([padding, height - margin.top - margin.bottom - padding]);
        var yScale2 =   d3.scale.linear()
                            .domain([yMin, yMax])
                            .range([height - margin.top - margin.bottom - padding, padding]);

//        Width = (width - padding * 2) / data.length - barMargin;


//            data = data.sort(function(a, b) {
//                return d3.descending(parseFloat(a.university_salary), parseFloat(b.university_salary));
//            });


        var svg = d3.select(".chart").append("svg")
                                    .attr("width", width)
                                    .attr("height", height);
        svg.selectAll(".salary")
            .data(datasheet)
            .enter()
            .append("text")
            .attr("class", "salary")
            .text(function(d){
                if(d.university_salary == 0){
                    console.log("test")
                    return "NoData";
                }
                return d.university_salary;
            })
            .attr({
                "x": function(d, i){
                    return xScale(i);
                },
                "y": height - margin.top - margin.bottom,
                "text-anchor": "center",
                "font-size": "1em",
            })
            .transition()
            .duration(1000)
            .attr({
                "y": function(d){
                    if(d.university_salary != 0 ){
                        return height - margin.top - margin.bottom - yScale(d.university_salary)  - 5;
                    }else{
                        return height - margin.top - margin.bottom;
                    }
                }
            });
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
        var barWidth = (width - legendPadding - axisPadding - padding * 2) / datasheet.length - barMargin;
    //bar chart
        var bar = svg.selectAll(".barChart")
                    .data(datasheet)
                    .enter()
                    .append("rect")
                    .attr('class', 'barChart');
        var color = d3.scale.category20b();
        bar.attr({
            "fill": function(d, i){
                return color(i);
            },
            "x": function(d, i){
                return xScale(i);
            },
            "y": height - margin.top - margin.bottom,
            "width": barWidth,
            "height": 0,
            "opacity": 0.5,
            "id": function(d){
                return "id" + d.code;
            }
            })
            .on("click", function(){
                var setNumber = d3.select(this).property("id");
                var setOpa = d3.select(this).attr("opacity");
                if(d3.select(this).attr("opacity") == 0.5 || d3.select(this).attr("opacity") == 0.2){
                    bar.attr({
                            "fill": function(d, i){
                                if(d.code != setNumber.slice(2)){
                                    return "#000";
                                }
                                return color(i);
                            },
                            "opacity": 0.2,
                            });
                    d3.selectAll("#" + setNumber).attr({
                        "opacity": 0.9,
                        "stroke": "rgba(0, 0, 0, 0.16)",
                        "stroke-width": 5,
                    });
                }else if(d3.select(this).attr("opacity") == 0.9){
                    d3.selectAll("#" + setNumber).attr({
                        "opacity": 0.5,
                        "stroke-width": 0,
                    });
                    bar.attr({
                        "fill": function(d, i){
                            return color(i);
                        },
                        "opacity": 0.5,
                    });
                }
            })
            .transition()
            .duration(1000)
            .attr({
                "y": function(d){
                    if(d.university_salary !== 0){
                        return height - margin.top - margin.bottom - yScale(d.university_salary);
                    }
                },
                "height": function(d){
                    if(d.university_salary != 0){
                        return yScale(d.university_salary);
                    }
                }
            });

//        var barTooltip = bar.append("title")
//                        .text(function(d) {
//                            return d.discipline;
//                        });

            //TEXT
//            console.log(data);
            //x axis
            var disciplineName = updataDisciplineName(datasheet);
            var xAxisTick = d3.svg.axis()
                        .scale(xScale)
                        .tickFormat(function(d, i) { return disciplineName[i]; })
                        .tickSize(0)
                        .ticks(datasheet.length)
                        .orient("bottom");

            svg.append("g")
                .attr({
                    "class": "xAxis",
                    "transform": "translate(" + (barWidth/2) + "," + (height - margin.top - margin.bottom) + ")"
                })
                .call(xAxisTick)
                .selectAll("text")
                .style({
                    "font-size": "14px",
                    "text-anchor": "start",
                    "letter-spacing": "1px",
                    "color": "#666666"
                })
                .attr({
                    "writing-mode": "vertical-lr",
                    "transform": "rotate(30)"
                });
        //line
            svg.append("line")
                .attr({
                  "x1": axisPadding,
                  "y1": yScale2(47300),
                  "x2": width - legendPadding - margin.left - margin.right - padding,
                  "y2": yScale2(47300),
                  "stroke": "#000099",
                  "stroke-width": 2,
                  "stroke-dasharray": 10,
                  "id": "averageLine",
                  "opacity": 0,
                })
    //            .on("mouseover", function() {
    //                console.log("fuck");
    //                d3.selectAll("#averageText").attr("opacity", 1)
    //            })
    //            .on("mouseout", function() {
    //                d3.selectAll("#averageText").attr("opacity", 0);
    //            })


            svg.append("text")//male line text
                .attr({
                    "x": width/2,
                    "y": yScale2(47300 + 1000),
                    "dy": ".35em",
    //                "fill": "#000029",
                    "id": "averageText",
                    "opacity": 0,
                })
                .text("103年平均薪資：47300(NTD)")
                .style({
                    "fill": "#000099",
                    "text-anchor": "middle",
                    "font-size": 16,
                })
            d3.select("#checkAverage")//maleAverage(checkbox) <--> on click function
                .on("click", function(){
                    if(d3.select("#averageLine").attr("opacity")==0&&
                       d3.select("#averageText").attr("opacity")==0){
                        d3.select("#averageLine").attr("opacity", 1);
                        d3.select("#averageText").attr("opacity", 1);
                    }else{
                        d3.select("#averageLine").attr("opacity", 0);
                        d3.select("#averageText").attr("opacity", 0);
                    }
                })
//     function updataData(data,indicator){
//         var result=[];
//         for (var foo in data){
//             data[foo]["selected"] = 0;
//         }
//         for (var foo in data) {
//             for(var barr in indicator){
//                 if(data[foo]["department_number"] === indicator[barr]["Id"]){
//                     result.push(data[foo]);
//                     data[foo]["selected"] = 1;
//                 }
//             }
//         }

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