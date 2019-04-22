class App extends React.Component {
	state = {
		count : 1
	}
	render() {
		return (
			<React.Fragment>
				{this.props.children}
				<h3 id="quantity">Quantity:</h3>
				<div className={this.setCounterClass()}>{this.format()}</div>
				<button onClick={() => this.props.changeValue(this.props.counter.id,1)} className="incrementButton">+</button>
				<button onClick={() => this.props.changeValue(this.props.counter.id,-1)} className="incrementButton">-</button>
				<button onClick={()=> this.props.onDelete(this.props.counter.id)} className="incrementButton">Remove Product</button>
			</React.Fragment>
		);
	}

	format(){
		const c = this.props.counter.value;
		return c === 0 ? 'zero' : c;
	}

	setCounterClass(){
		let classes = 'counter ';
		classes += this.props.counter.value === 0 ? 'warning' : 'primary';
		return classes;
	}
}

class Counters extends React.Component {
	state = {
		counter : []
	}
	count = 1;
	buildProduct = (name)=>{
		var product = {
			ProductName : name,
			id : this.rand(),
			value : 1
		}
		return product;
	}
	rand = ()=>{
		var r = Math.floor(Math.random()*Math.pow(10,Math.random()*10))
		console.log(r)
		return r;
	}
	changeValue = (id,v) =>{
		this.state.counter.forEach((value,index)=>{
			if(value.id == id){
				if(value.value + v >= 0){
					var counter = [...this.state.counter]
					counter[index].value += v
					this.saveData([counter[index]])
					this.setState({counter : counter});
				}else{
					alert('NO More Product Available To Delete')
				}
			}
		})
	}

	addProduct = (name)=>{
		var x = this.buildProduct(name);
		var counter = [...this.state.counter,x];
		this.saveData([x])
		this.setState({counter : counter})
	}

	saveData = (counter)=>{
		var user = document.querySelector('#user')
		var request = new XMLHttpRequest()
		request.onload = ()=>{
			if(request.status === 200){
				console.log('DATA ADDED SUCCESSFULY')
			}
		}
		counter.forEach((value)=>{
			value['Username'] = user.textContent
		})
		request.open('POST','Update')
		request.send(JSON.stringify(counter))
	}

	deleteProduct = (id)=>{
		var user = document.querySelector('#user')
		var del = [];
		var counter = this.state.counter.filter((value)=>{
			if(value.id === id){
				del = value;
				return false
			}else{
				return true;
			}
		})
		var request = new XMLHttpRequest()
		request.onload = ()=>{
			console.log('Data Deleted')
		}
		del['Username'] = user.textContent
		console.log(del)
		request.open('POST','Delete')
		request.send(JSON.stringify([del]))
		this.setState({counter : counter})
	}

	callAddProduct = ()=>{
		var x = prompt("Enter Product Name: ")
		if(x){
			this.addProduct(x)
		}else{
			alert('Enter a valid Product name')
		}
	}

	reset = () => {
		this.state.counter.forEach((value)=>{
			value.value = 0;
		})
		this.saveData(this.state.counter)
		this.setState(this.state.counter)
	}

	componentDidMount(){
		var user = document.querySelector('#user')
		var request = new XMLHttpRequest()
		request.onload = ()=>{
			console.log(request.textContent)
			if(request.status === 200){
				var counter = JSON.parse(request.responseText)
				this.count = counter[counter.length-1].id + 1
				this.setState({counter : counter})
			}
		}
		console.log(Math.random())
		request.open('GET',user.textContent)
		request.send()
	}
	render() {
		return (
			<div>
				<button className="incrementButton" onClick={this.callAddProduct}>Add Product</button>
				<button className='incrementButton' onClick={this.reset}>Reset</button>
				{
					this.state.counter.map( (a) => 
						<div key={a.id} className="product">
							<App  
							key={a.id} 
							counter = {a}
							onDelete = { this.deleteProduct }
							changeValue = {this.changeValue}> 
								<h1> ProductName: {a.ProductName} </h1>
							</App>
						</div>
					)
				}
			</div>
		)
	}
}
ReactDOM.render(<Counters />,document.querySelector('#id'))