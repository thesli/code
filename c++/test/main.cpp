#include <igloo/igloo_alt.h>
#include "circle.h"
using namespace igloo;


Describe(someCoolTest){	
	Circle t;	
	It(hasAOneEqOneExample){
		int x = 100;
		Assert::That(x,Is().GreaterThan(50).And().Not().EqualTo(100));
	};
	It(hasATrueResult){
		int x = 50;
		Assert::That(x,Is().EqualTo(50));
	};
	It(CircleShouldHaveABarValue){
		Assert::That(t.bar,Is().EqualTo(123));
	};
	Describe(OtherStupidTest){
		It(hasTrueToBeTrue){
			char a = 'a';
			Assert::That(a,Is().EqualTo('a'));
		};
		It(hasFalseStuff){
			char b = 'b';
			Assert::That(b,Is().EqualTo('a'));
		};
	};
};


class TestListener{
public:
	
};


int main(int argc, char *argv[])
{			
	return TestRunner::RunAllTests(argc,argv);
}