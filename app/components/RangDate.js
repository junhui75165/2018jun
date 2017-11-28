/**
 * Created by junhui on 2017/10/10.
 */
(function () {
    "use strict";
    let React = require('react');
    // let DatePicker = require('react-datepicker');
    // let { Col, Row ,Button ,Icon,message} = require('antd');
    let moment = require('moment');
    // require('react-datepicker/dist/react-datepicker.css');
    class RangDate extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                startDate: moment(),
                endDate: moment(),
            };
        }

        componentWillMount() {
            console.log(456)
        }


        componentDidMount() {
            console.log(123)
        }

        handleChangeStart(data){
            this.setState({
                startDate:data
            })
        }
        handleChangeEnd(data){
            this.setState({
                endDate:data
            })
        }

        render() {
            return (
                <div>
                    {/*<Row className="am-padding">*/}
                    {/*<Col xs={8}>*/}
                    {/*{this.state.startDate}*/}
                    {/*</Col>*/}
                    {/*<Col xs={16}>*/}
                    {/*<Col xs={12} className="am-padding">*/}
                    {/*<DatePicker*/}
                    {/*inline*/}
                    {/*showMonthDropdown*/}
                    {/*showYearDropdown*/}
                    {/*dropdownMode="select"*/}
                    {/*selected={this.state.startDate}*/}
                    {/*selectsStart*/}
                    {/*startDate={this.state.startDate}*/}
                    {/*endDate={this.state.endDate}*/}
                    {/*onChange={this.handleChangeStart.bind(this)}*/}
                    {/*/>*/}
                    {/*</Col>*/}
                    {/*<Col xs={12} className="am-padding">*/}
                    {/*<DatePicker*/}
                    {/*inline*/}
                    {/*showMonthDropdown*/}
                    {/*showYearDropdown*/}
                    {/*dropdownMode="select"*/}
                    {/*selected={this.state.endDate}*/}
                    {/*selectsEnd*/}
                    {/*startDate={this.state.startDate}*/}
                    {/*endDate={this.state.endDate}*/}
                    {/*onChange={this.handleChangeEnd.bind(this)}*/}
                    {/*/>*/}
                    {/*</Col>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}
                </div>
            );
        }
    }
    module.exports = RangDate;
})();