/**
 * Created by junhui on 2017/5/2.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request,} = require('../request');
    let { Card, Col, Row ,Button,Table,DatePicker,Icon} = require('antd');
    const RangePicker = DatePicker.RangePicker;
    let {getDateVnum,toThousands,GetLocalStorage} = require('../tool');
    class YearIncome extends React.Component{
        constructor(props){
            super(props);
            console.log(this.props);
            this.state = {
                trans_from_date: moment().startOf('year').format('YYYY-MM-D'),
                trans_to_date:moment().endOf('year').format('YYYY-MM-D'),
                content:[],
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                loading:false,
                openDate:false
            }
        }

        componentWillMount() {
            this.setTable(this.props.data);
            let cb = (data)=>{
                this.setState({
                    trans_from_date:moment(data.date_).startOf('year').format('YYYY-MM-D'),
                    trans_to_date:moment(data.date_).endOf('year').format('YYYY-MM-D'),
                    dateVnum:data,
                },()=>{
                    this.goSearch();
                })
            };
            getDateVnum(cb);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            if(nextProps.data){
                this.setTable(nextProps.data);
            }
        }

        setTable(receive){
            let title = [];
            receive.title.map((data,i)=>{
                title[i] = {};
                title[i].title = data;
                title[i].key = i;
                title[i].dataIndex = i;
            });
            let content = [];
            for(let i in receive.content){
                let data = {};
                let index = 0;
                data[index] = receive.content[i].account||receive.content[i];
                if(receive.content[i].account){
                    receive.content[i].cost.map((item,j)=>{
                        index++;
                        if(item!=0){
                            item = toThousands(item);
                        }else {
                            item = '0.00';
                        }
                        data[index] = <div className="right">{item}</div>;
                    });
                    let total = receive.content[i].total;
                    if(total!=0){
                        total = toThousands(total);
                    }else {
                        total = '0.00';
                    }
                    data[index+1] = total;
                }
                content.push(data);
            }
            this.setState({
                title:title,
                content:content,
                loading:false,
            },()=>{console.log(this.state)})
        }

        changeDate(date,dateString){
            this.setState({
                trans_from_date:moment(date[0]).format('YYYY-MM-D'),
                trans_to_date:moment(date[1]).format('YYYY-MM-D'),
                openDate:false
            })
        }
        goSearch(){
            let par = {
                trans_from_date: this.state.trans_from_date,
                trans_to_date: this.state.trans_to_date,
            };
            this.setState({loading:true,},()=>{
                this.props.searchDate(par);
            })
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        render() {
            const month = GetLocalStorage('Const').fiscal_year_end_month;
            let startYear = moment(this.state.dateVnum.date_).year()+'-'+(month==12?1:Number(month)+1);
            let endYear = (month==12?moment(this.state.dateVnum.date_):moment(this.state.dateVnum.date_).add(1,'year')).year()+'-'+(month);
            const ranges = [
                {
                    from:{
                        title:'当前会计月份',
                        date:[moment(this.state.dateVnum.date_).startOf('month'), moment(this.state.dateVnum.date_).endOf('month')]
                    },
                    to:{
                        title:'上一会计月份',
                        date:[moment(this.state.dateVnum.date_).subtract(1,'month').startOf('month'), moment(this.state.dateVnum.date_).subtract(1,'month').endOf('month')]
                    }
                },
                {
                    from:{
                        title:'当前会计年度',
                        date:[moment(startYear).startOf('month'), moment(endYear).endOf('month')]
                    },
                    to:{
                        title:'上一会计年度',
                        date:[moment(startYear).subtract(1,'year'), moment(endYear).subtract(1,'year')],
                    }
                },
                {
                    from:{
                        title:'往前一个月',
                        icon:'left',
                        date:[moment(this.state.trans_from_date).subtract(1, 'month').startOf('month'), moment(this.state.trans_to_date).subtract(1, 'month').endOf('month')],
                    },
                    to:{
                        title:'往后一个月',
                        icon:'right',
                        date:[moment(this.state.trans_from_date).add(1, 'month').startOf('month'), moment(this.state.trans_to_date).add(1, 'month').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一年',
                        icon:'double-left',
                        date:[moment(this.state.trans_from_date).subtract(1, 'year').startOf('year'), moment(this.state.trans_to_date).subtract(1, 'year').endOf('year')],
                    },
                    to:{
                        title:'往后一年',
                        icon:'double-right',
                        date:[moment(this.state.trans_from_date).add(1, 'year').startOf('year'), moment(this.state.trans_to_date).add(1, 'year').endOf('year')],
                    }
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">年度收入费用分析</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={6} offset={15}>
                                <RangePicker onChange={this.changeDate.bind(this)}
                                             value={[moment(this.state.trans_from_date), moment(this.state.trans_to_date)]}
                                             format="YYYY-MM-DD"
                                             open={this.state.openDate}
                                             onOpenChange={this.onOpenChange.bind(this)}
                                             renderExtraFooter={
                                                 ()=>{
                                                     return <div>
                                                         {
                                                             ranges.map((item,key)=>{
                                                                 return<Row key={key} type="flex" justify="space-around">
                                                                     <Col xs={8}>
                                                                         <Button icon={item.from.icon?item.from.icon:null} onClick={this.changeDate.bind(this,item.from.date)} style={{width:'100%'}}>
                                                                             {item.from.title}
                                                                         </Button>
                                                                     </Col>
                                                                     <Col xs={8}>
                                                                         <Button  onClick={this.changeDate.bind(this,item.to.date)} style={{width:'100%'}}>
                                                                             {item.to.title}
                                                                             <Icon type={item.to.icon?item.to.icon:null} />
                                                                         </Button>
                                                                     </Col>
                                                                 </Row>
                                                             })
                                                         }
                                                     </div>
                                                 }
                                             }
                                />
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button type="primary" icon="search" onClick={this.goSearch.bind(this)}>搜索</Button>
                            </Col>
                        </Row>
                        <Row className="certificate-table">
                            <Table bordered pagination={false} scroll={{x:'100%'}} size="small"
                                   loading={this.state.loading}
                                   dataSource={this.state.content} columns={this.state.title}/>
                        </Row>
                    </Card>
                </div>
            );
        }

    }
    module.exports = YearIncome;
})();