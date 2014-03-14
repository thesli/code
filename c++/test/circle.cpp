#include "circle.h"
#include <iostream>

void Circle::test(){
	using namespace std;
	bar = 567;
	cout << "bar is changed to 567" << endl;
};
Circle::Circle(){
	bar = 123;
};