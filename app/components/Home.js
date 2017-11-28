/**
 * Created by junhui on 2017/9/14.
 */
(()=>{
    "use strict";
    let React = require('react');
    let moment = require('moment');
    let { hashHistory} = require('react-router');
    let { Card, Col, Row ,DatePicker ,message,Modal,Calendar } = require('antd');
    const { MonthPicker,} = DatePicker;
    const language = require('../Language');
    class Home extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                list:[],
                process:[],
                account:[],
                info:[],
                direct:require('../img/direct.png'),
                receive:[
                    '开始',
                    [
                        '折旧',
                        '计提',
                    ],
                    '更新',
                    '结束',
                ]
            };
        }

        componentDidMount() {
            const list = [
                {
                    name:language.VoucherEntry,
                    description:language.VoucherEntryTips,
                    // img:require('../img/table.png'),
                    img:require('../img/table_min.png'),
                    page:101,
                    className:'table'
                },
                {
                    name:language.BookSearch,
                    description:language.BookSearchTips,
                    // img:require('../img/book.png'),
                    img:require('../img/book_min.png'),
                    page:103,
                    className:'book'
                },
                {
                    name:language.PrintOutput,
                    description:language.PrintOutputTips,
                    // img:require('../img/folder.png'),
                    img:require('../img/folder_min.png'),
                    page:107,
                    className:'folder'
                },
                {
                    name:language.TrialBalance,
                    description:language.TrialBalanceTips,
                    // img:require('../img/banlance.png'),
                    img:require('../img/banlance_min.png'),
                    page:105,
                    className:'balance'
                },
            ];
            const process = [
                [
                    {
                        name:language.VoucherEntry,
                        img:require('../img/process1.png'),
                        page:"101",
                    },
                    {
                        name:language.VoucherSearch,
                        img:require('../img/process1.png'),
                        page:"102",
                    },
                ],
                [
                    {
                        name:language.DepreciationPosting,
                        img:require('../img/process3.png'),
                        page:"115",
                    },
                    {
                        name:language.CarryoverCosts,
                        img:require('../img/process4.png'),
                        page:"119",
                    },
                    {
                        name:language.RevaluationCurrencyAccounts,
                        img:require('../img/process5.png'),
                        page:"117",
                    },
                ],
                [
                    {
                        name:language.ManuallyBalanceCarryForward,
                        img:require('../img/process6.png'),
                        page:"113",
                    }
                ],
                [
                    {
                        name:language.BookSearch,
                        img:require('../img/process7.png'),
                        page:"103",
                    },
                    {
                        name:language.TrialBalance,
                        img:require('../img/process8.png'),
                        page:"105",
                    },
                    {
                        name:language.BalanceSheet,
                        img:require('../img/process9.png'),
                        page:"104",
                    },
                    {
                        name:language.ProfitStatement,
                        img:require('../img/process10.png'),
                        page:"106",
                    },
                ]
            ];
            const account = [
                {
                    name:'银行存款(元)',
                    total:"891,123.58",
                    col:8
                },
                {
                    name:'现金(元)',
                    total:"891,123.58",
                    col:8
                },
                {
                    name:'存款(元)',
                    total:"891,123.58",
                    col:8
                },
            ];
            const info = [
                {
                    name:'收入',
                    year:'8532,654.56',
                    month:'23,12.94'
                },
                {
                    name:'开支',
                    year:'8532,654.56',
                    month:'23,12.94'
                },
                {
                    name:'利润',
                    year:'8532,654.56',
                    month:'23,12.94'
                },
                {
                    name:'税率',
                    year:'8532,654.56',
                    month:'23,12.94'
                },
                {
                    name:'税负率',
                    year:'8532,654.56',
                    month:'23,12.94'
                },
            ];
            this.setState({
                list,process,account,info
            });
            // this.raphael();
            this.goJs();
        }
        showConnections(item) {
            console.log('test..',item);
        }
        goJs(list){
            let $this = this;
            let $ = go.GraphObject.make;
            let myDiagram = $(go.Diagram, "paper",{
                initialContentAlignment: go.Spot.Left, // center Diagram left
                "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
                "animationManager.isEnabled": true,
                "animationManager.duration": 800, // slightly longer than default (600ms) animation
                // "commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },
                initialAutoScale: go.Diagram.Uniform, //初始自动缩放
                isReadOnly: true,  // do not allow users to modify or select in this view
                allowSelect: true, //允许选中
                allowHorizontalScroll:false,//允许横向移动
                allowVerticalScroll:false,//允许纵向移动
                // layout: $(go.TreeLayout, { nodeSpacing: 5 }),  // automatically laid out as a tree
                layout: $(go.LayeredDigraphLayout)
            });
            myDiagram.groupTemplate =
                $(go.Group, "Auto",
                    // declare the Group.layout:
                    { layout: $(go.LayeredDigraphLayout,
                        { direction: 0, columnSpacing: 10 }) },
                    $(go.Shape, "RoundedRectangle",  // surrounds everything
                        { parameter1: 10, fill: "rgba(128,128,128,0.33)" }),
                    $(go.Panel, "Vertical",  // position header above the subgraph
                        // $(go.TextBlock,     // group title near top, next to button
                        //     { font: "Bold 12pt Sans-Serif" },
                        //     new go.Binding("text",'')),
                        $(go.Placeholder,     // represents area for all member parts
                            { padding: 5, background: "white" },
                            // new go.Binding('background','done',(done)=>{
                            //     return done?'#efbebc':'white'
                            // })
                        ),
                    ),
                );
            myDiagram.nodeTemplate =
                $(go.Node,
                    'Auto',
                    {
                        click: function(e, node) {
                            let item = node.Zd;
                            if(item.children){
                                return ;
                            }else {
                                $this.showConnections(item);
                            }
                        }  // defined below
                    },
                    $(go.Shape, "RoundedRectangle",{ fill: "white" },
                        new go.Binding("fill", "done",(done)=>{ return done?'#d7ecfd':'white'; }),
                        // new go.Binding("width", "color",()=>{return '10'}),
                    ),// Shape.fill is bound to Node.data.color
                    // $(go.Panel, "Vertical",
                    //     new go.Binding("itemArray", "children"),
                    //     {
                    //         itemTemplate:
                    //             $(go.Panel, "Auto", { margin: 5 },
                    //                 {
                    //                     click: function(e, node) { $this.showConnections(node.Zd); }  // defined below
                    //                 },
                    //                 $(go.Shape, "RoundedRectangle",{ fill: "grey" },
                    //                     new go.Binding("fill", "done",(done)=>{
                    //                         return done?'red':'grey';
                    //                     })),
                    //                 $(go.TextBlock, new go.Binding("text", "text"),
                    //                     { margin: 5 })
                    //             )
                    //     }),
                    $(go.TextBlock, { margin: 5 }, new go.Binding("text","item",(item)=>{
                        return item.children?null:item.text;
                    })),
                    // { // this tooltip Adornment is shared by all nodes
                    //     toolTip:
                    //         $(go.Adornment, "Auto",
                    //             $(go.Shape, { fill: "#FFFFCC" }),
                    //             $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                    //                 new go.Binding("text", "text"))
                    //         ),
                    // }
                );

            myDiagram.linkTemplate =
                $(go.Link,
                    { routing: go.Link.Orthogonal, corner: go.Link.Bezier },//折线
                    // {
                        // routing: go.Link.Normal,//直线
                        // curve: go.Link.Bezier
                    // },
                    $(go.Shape,
                        new go.Binding("stroke",'done',(done)=>{
                            return done?'red':'black';
                        })),
                    $(go.Shape,
                        {toArrow: "Standard",stroke: null },
                        new go.Binding("fill",'done',(done)=>{
                            // let red = false;
                            // if(item.all){
                            //     let length = 0;
                            //     item.children.map((con)=>{
                            //         if(con.done){
                            //             length++;
                            //         }
                            //     });
                            //     red = length==item.children.length;
                            // }else if(item.children){
                            //     item.children.map((con)=>{
                            //         if(con.done){
                            //             red = true;
                            //         }
                            //     })
                            // }
                            return done?'red':'black';
                        })
                    )
                );

            // let nodeDataArray = [
            //     { key: "root" ,id:0,text:'开始',children:[{key:'twoA',done:true},{key:'twoB'}]},
            //     { key: "twoA", text:'子节点a1',children: [{key:'threeA',done:true},{key:'threeB'}]},
            //     { key: "twoB", text:'子节点a2',children:[{key:'threeC'}]},
            //     { key: "threeA",text:'子节点b1',children:[{key:'fourA',done:true}]},
            //     { key: "threeB",text:'子节点b2',children:[{key:'fourA'}]},
            //     { key: "threeC",text:'子节点b3',children:[{key:'fourA'}]},
            //     { key: "fourA",text:'子节点c1',children:[{key:'fiveA'}]},
            //     { key: "fiveA",text:'结束'}
            // ];
            let nodeDataArray = [
                { key: "0" ,id:0,text:'开始',done:true},
                { key: "1", id:1,text:'子节点组a',all:false,done:true,isGroup: true,
                    // children:
                    //     [
                    //         {key:'twoA',text:'子节点a1',id:2,done:true},
                    //         {key:'twoB',text:'子节点a2',id:3}
                    //     ]
                },
                {key:'2',text:'子节点a1',id:2,done:true,group: "1"},
                {key:'3',text:'子节点a2',id:3,group: "1"},
                { key: "4",id:4,text:'子节点组b',all:true,done:true,isGroup: true,
                    // children:
                    //     [
                    //         {key:'threeA',text:'子节点b1',id:5,done:true},
                    //         {key:'threeB',text:'子节点b2',id:6,done:true},
                    //         {key:'threeC',text:'子节点b3',id:7,done:true},
                    //     ]
                },
                {key:'5',text:'子节点b1',id:5,done:true,group:"4"},
                {key:'6',text:'子节点b2',id:6,done:true,group:"4"},
                {key:'7',text:'子节点b3',id:7,done:true,group:"4"},
                { key: "8",text:'子节点c1',id:8},
                { key: "9",text:'结束',id:9}
            ];
            let linkDataArray = [];
            let keyIndex;
            nodeDataArray.map((item,index)=>{
                if(!item.group){
                    if(typeof keyIndex == 'undefined'){
                        keyIndex = index;
                    }else {
                        let data = {
                            from:nodeDataArray[keyIndex].key,
                            to:item.key,
                            done:nodeDataArray[keyIndex].done
                        };
                        linkDataArray.push(data);
                        keyIndex = index;
                    }
                }
                // if(index+1<nodeDataArray.length){
                //     let data = {from:index,to:index+1,done:item.done};
                //     linkDataArray.push(data);
                // }
                item.item = Object.assign({},item);
            });
            myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
            console.log(linkDataArray);
        }
        raphael(){
            let paper = Raphael("paper", '100%', 480);
            let attr = {
                fill: Raphael.getColor(),
                stroke: "#666",
                "stroke-width": 1,
                "stroke-linejoin": "round"
            };
            let list = {};
            list.start = paper.rect(80,220,20,20);
            list.start.attr(attr);
            list.start.data("i", 3);//key value
            list.start.click(function () {
                console.log(this.data("i"));
            });
            list.start.text = paper.text(100,240,'开始');
            list.start.text.data("i", 3);//key value
            list.start.text.click(function () {
                console.log(this.data("i"));
            });

        }
        goUrl(page){
            if(page){
                hashHistory.push('/mainPage/'+page);
            }
        }
        setImgStyle(type,ref){
            let e = this.refs[ref];
            if(type == 'over'){
                e.className = 'animated bounceIn'
            }else {
                e.className = 'animated'
            }
        }
        resetHeight(){
            let e = this.refs.width;
            if(!e){
                return ''
            }
            console.log(e.offsetWidth);
            let w = e.offsetWidth/2-10;
            let h = w*740/815;
            // return h+'px';
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card className="genson-home"
                          bordered={true} bodyStyle={{minHeight:'100%'}}>
                        <div className="gen-main-head" ref="width">
                            {
                                this.state.list.map((item)=>{
                                    return <a className="link">
                                        <Card bodyStyle={{ padding: '20px 10px',textAlign:'center'}}
                                              onClick={this.goUrl.bind(this,item.page)}
                                              className={item.className}>
                                            <Col xs={14}>
                                                <h2>
                                                    <a style={{color:'white'}}>{item.name}</a>
                                                </h2>
                                                <p style={{color:'white'}}>{item.description}</p>
                                            </Col>
                                            <Col xs={10}>
                                                <img onClick={this.goUrl.bind(this,item.page)} ref={item.page} className="animated"
                                                     onMouseOver={this.setImgStyle.bind(this,'over',item.page)}
                                                     onMouseOut={this.setImgStyle.bind(this,'out',item.page)}
                                                     src={item.img} alt=""/>
                                            </Col>
                                        </Card>
                                    </a>
                                })
                            }
                        </div>
                        <Row type="flex" justify="space-between" align="top" className="genson-margin-top">
                            <Col xs={12} className="gen-main-fun">
                                <div style={{height:this.resetHeight()}}>
                                    {
                                        this.state.process.map((row,index)=>{
                                            return <div>
                                                <Row className="step-block" type="flex" justify="space-around" align="middle">
                                                    {
                                                        row.map((item)=>{
                                                            return <div>
                                                                <a title={item.name}>
                                                                    <img ref={'a'+item.page} src={item.img} alt="" className="animated"
                                                                         onMouseOver={this.setImgStyle.bind(this,'over','a'+item.page)}
                                                                         onMouseOut={this.setImgStyle.bind(this,'out','a'+item.page)}
                                                                         onClick={this.goUrl.bind(this,item.page)}/>
                                                                </a>
                                                                <h3>{item.name}</h3>
                                                            </div>
                                                        })
                                                    }
                                                </Row>
                                                <Row className="center direct" style={{display:index==this.state.process.length-1?'none':'block',margin:'1rem'}}>
                                                    <img src={this.state.direct} alt=""/>
                                                </Row>
                                            </div>
                                        })
                                    }
                                </div>
                            </Col>
                            <Col xs={12} lg={10} className="gen-main-list">
                                <div style={{height:this.resetHeight()}}>
                                    <div className="right"><MonthPicker  defaultValue={moment()}/></div>
                                    <Row type="flex" justify="space-around" align="middle" className="genson-margin-top center">
                                        {
                                            this.state.account.map((item)=>{
                                                return <Col xs={item.col}>
                                                    <h2>{item.total}</h2>
                                                    <p>{item.name}</p>
                                                </Col>
                                            })
                                        }
                                    </Row>
                                    <div className="genson-margin-top">
                                        <Row type="flex" justify="space-around" align="middle" className="right-title">
                                            <Col xs={8} offset={8}>
                                                <h3>本月</h3>
                                            </Col>
                                            <Col xs={8} >
                                                <h3>本年</h3>
                                            </Col>
                                        </Row>
                                        <div className="right-content">
                                            {
                                                this.state.info.map((item)=>{
                                                    return <Row type="flex" justify="space-around" align="middle" className="genson-margin-top">
                                                        <Col xs={6} >
                                                            <h3>{item.name}</h3>
                                                        </Col>
                                                        <Col xs={6} offset={2}>
                                                            <h3>{item.month}</h3>
                                                        </Col>
                                                        <Col xs={6} offset={2}>
                                                            <h3>{item.year}</h3>
                                                        </Col>
                                                    </Row>
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <div id="paper" className="gen-main-fun" style={{marginTop:'1rem'}}>

                        </div>
                    </Card>
                </div>
            );
        }

    }
    module.exports = Home;
})();