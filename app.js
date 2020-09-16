/* 
TODO List:
1. Add event handler
2. Get input values
3. Add the new item to our data structure 
4. Add the new item to the UI
5. Calculate the budget 
6. Update the UI

Modules:

UI Module - UI Controller
2. Get input values
4. Add the new item to the UI 
6. Update the UI

Data Module - BudgetController
3. Add the new item to our data structure 
5. Calculate the budget 

Control Module - main Controller
1. Add event handler

*/

var Money = function(description, cost, id, percent){
    this.description = description;
    this.cost = cost;
    this.id = id;
    this.percent = percent;
}

var budgetController = (function() {
    var idCounter = 0;
    var expenseList = [];
    var expenseTotal = function(){
        return sumList(expenseList);
    }
    var incomeList = [];
    var incomeTotal = function(){
        return sumList(incomeList);   
    }
    
    var sumList = function(list){
        var total = 0.00;
        for(i in list){
            total += parseFloat(list[i].cost);
        }
        return total.toFixed(2);
    }
    
    var addToList = function(money, list){
        list.push(money);
    }
    
    var createMoney = function(desc, cost, id, percent){
        return (new Money(desc, cost, id, percent));
    }
    
    var addExpenseToList = function(desc, cost){
        //returns the item added to the list;
        var expense = createMoney(desc,cost, idCounter, 0);
        addToList(expense,expenseList);
        expenseList[expenseList.length-1].percent = calcExpensePercent(cost);
        idCounter++;
        return expense;
    }
    
    var addIncomeToList = function(desc, cost){
        //returns the item added to the list
        var income = createMoney(desc, cost, idCounter, 0);
        addToList(income, incomeList);
        idCounter++;
        return income;
    }
    
    var calcExpensePercent = function(expenseNum){
        var perc = +((expenseNum / incomeTotal())*100).toFixed(0);
        if(perc == NaN || perc == Infinity){
            return "--"
        }
        return perc + "%"
    }
    
    var totalBudget = function(){
        return parseFloat(incomeTotal() - expenseTotal()).toFixed(2);;
    }
    
    var updateAllPerc = function(){
        for(i in expenseList){
            var curr = expenseList[i]
            curr.percent = calcExpensePercent(curr.cost);
        }
    }
    
    var removeItem = function(id, type){
        // 0 - income
        // 1 - expense
        var index, list, checkList;
        if(type === 0){
            list = incomeList;
        } else {
            list = expenseList;
        }
        checkList = list.map(function(x){
            return x.id == id;
        });
        index = checkList.indexOf(true);
        var newList = []
        for(i in list){
            if(i != index){
                newList.push(list[i])
            }
        }
        if(type === 0){
            incomeList = newList;
        } else {
            expenseList = newList;
        }
    }
    
    return {
        addMoney: function(desc, cost, type){
            var returnList;
            if(type === 0){
                returnList = addIncomeToList(desc,cost);
            } else {
                returnList = addExpenseToList(desc, cost);   
            }
            updateAllPerc();
            return returnList;
            
        },
        calculateExpensePercent: function(num){
            return calcExpensePercent(num);
        },
        calcTotalBudget: function(){
            return totalBudget();
        },
        getIncTotal: function(){
            return incomeTotal();
        },
        getExpTotal: function(){
            return expenseTotal();
        },
        removeMoney: function(id, type){
            removeItem(id, type);
            updateAllPerc();
        },
        getExpenseList: function(){
            return expenseList;
        }
    }
    
    
})();

var uiController = (function() {
    var typeSel = function(){
        // 0 - income
        // 1 - expense
        var selc = document.querySelector(".add__type").value;
        if(selc === "inc"){
            return 0
        } else {
            return 1
        }
    }
    
    var addCommas = function(num){
        return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
    
    var getDateYear = function(){
        var date = new Date();
        return date.getFullYear();
    }
    
    var getDateMonth = function(){
        var date = new Date();
        return date.toLocaleDateString("default", {month: "long"});
    }
    
    var clearFields = function(){
        document.querySelector(".add__description").value = ""
        document.querySelector(".add__value").value = ""
    }
    
    var addMoneyToList = function(item, itemType){
        var html, container;
        if(itemType === 0){
            container = document.querySelector(".income");
            html = '<div class="item clearfix" id="income-%itemId%"><div class="item__description">%itemDesc%</div><div class="right clearfix"><div class="item__value">+ %itemValue%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else {
            container = document.querySelector(".expenses")
            html = '<div class="item clearfix" id="expense-%itemId%"><div class="item__description">%itemDesc%</div><div class="right clearfix"><div class="item__value">- %itemValue%</div><div class="item__percentage">%itemPercent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            html = html.replace("%itemPercent%", item.percent);
        }
        html = html.replace("%itemDesc%", item.description);
        html = html.replace("%itemValue%", addCommas(item.cost));
        html = html.replace("%itemId%", item.id);
        
        container.insertAdjacentHTML("beforeend", html);
    }
    
    var updateBudgetVal = function(num){
        var title = document.querySelector(".budget__value");
        var text;
        if(num > 0){
            text = "+" + addCommas(num); 
        } else {
            text = addCommas(num);
        }
        title.textContent = text;
    }
    
    var updateIncVal = function(num){
        var title = document.querySelector(".budget__income--value");
        var text = "+ " + addCommas(num);
        title.textContent = text;
    }
    
    var updateExpVal = function(num, perc){
        var titleV = document.querySelector(".budget__expenses--value");
        var titleP = document.querySelector(".budget__expenses--percentage");
        var textV = "- " + addCommas(num);
        var textP = perc
        titleV.textContent = textV;
        titleP.textContent = textP;
    }
    
    var removeItem = function(id){
        var item = document.getElementById(id)
        item.parentNode.removeChild(item);
    }
    
    var updatePerc = function(id, perc){
        var parent = document.getElementById("expense-" + id);
        var percent = parent.querySelector(".item__percentage");
        percent.textContent = perc;
    }
    
    var changeTypeColor = function(){
        var fields = document.querySelectorAll(".add__type,.add__description,.add__value");
        
        fields.forEach(function(curr){
            curr.classList.toggle("red-focus");
        })
        document.querySelector(".add__btn").classList.toggle("red");
    }
    
    return {
        addItem: function(item, type){
            addMoneyToList(item, type);
        },
        setDate: function(){
            var title = document.querySelector(".budget__title--month");
            title.textContent = getDateMonth() + " " + getDateYear();
        },
        getDescInput: function(){
            return document.querySelector(".add__description").value;
        },
        getValInput: function(){
            return document.querySelector(".add__value").value;
        },
        getTypeSel: function(){
            return typeSel();
        },
        updateInc: function(num){
            updateIncVal(num);
        },
        updateExp: function(num, perc){
            updateExpVal(num, perc);
        },
        updateBudget: function(num){
            updateBudgetVal(num);
        },
        clearInputFields: function(num){
            clearFields();
        },
        removeMoney: function(id){
            removeItem(id);
        },
        updateExpPerc: function(id, perc){
            updatePerc(id, perc);
        },
        changeColor: function(){
            changeTypeColor();
        }
    };
    
    
    
})();

var mainController = (function(budgetController, uiController){
    uiController.setDate();
    var updateExpPerc = function(){
        var expenseList = budgetController.getExpenseList();
        for(i in expenseList){
            var current = expenseList[i];
            uiController.updateExpPerc(current.id, current.percent);
        }
    }
    var updateBudgetText = function(){
        var incTotal = budgetController.getIncTotal();
        var expTotal = budgetController.getExpTotal();
        var expPerc = budgetController.calculateExpensePercent(expTotal);
        var budgetTotal = budgetController.calcTotalBudget();
        uiController.updateInc(incTotal);
        uiController.updateExp(expTotal,expPerc);
        uiController.updateBudget(budgetTotal);
    };
    
    var container = document.querySelector(".container")
    var ctrlDeleteItem = function(event){
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            var splitId = itemId.split("-");
            var itemTypeText = splitId[0];
            var moneyId = splitId[1];
            var itemType;
            if(itemTypeText == "income"){
                itemType = 0
            } else {
                itemType = 1
            }
            budgetController.removeMoney(moneyId, itemType);
            uiController.removeMoney(itemId);
            updateBudgetText();
            if(itemType === 0){
                updateExpPerc();
            }
        }
    }
    
    var addButton = document.querySelector(".add__btn");
    var addButtonPress = function(){
        var descText = uiController.getDescInput();
        var valText = parseFloat(uiController.getValInput()).toFixed(2);
        var typeSel = uiController.getTypeSel();
        if(descText && valText){
            var item = budgetController.addMoney(descText,valText,typeSel);
            uiController.addItem(item, typeSel);
            updateBudgetText();
            uiController.clearInputFields();
            if(typeSel === 0){
                updateExpPerc();
            }
        }
    }
    var typeSelector = document.querySelector(".add__type")
    
    typeSelector.addEventListener("change", uiController.changeColor)
    addButton.addEventListener("click", addButtonPress);
    container.addEventListener("click", ctrlDeleteItem);
    
    
})(budgetController, uiController);
