export default function Demo() {
    const message = 'hello Web3'
    let age = 20
    const students= [
            { id: 111, name: "stu1", score: 100 },
            { id: 112, name: "stu2", score: 70 },
            { id: 113, name: "stu3", score: 90 },
            { id: 114, name: "stu4", score: 80 },
          ]
    return (
        <div>
        <h1>{message}</h1>
        <p>{age > 18 ? '成年' : '未成年'}</p>
        {
            students.filter(item => item.score > 60).map(item => {
                return (
                <div className="item" key={item.id}>
                    <span>学号: {item.id}</span>
                    <span>姓名: {item.name}</span>
                    <span>分数: {item.score}</span>
                </div>
                )
            })
        }
        </div>
    );
}